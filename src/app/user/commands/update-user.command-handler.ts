import { BaseCommandHandler, EventDispatcher, InjectionConstant } from '@/app/common';
import {
  BadRequest,
  DomainErrorCode,
  mapToVoid,
  NotFound,
  OptimisticLockingException,
  Result,
  retryOn,
  throwIfVoid,
} from '@/domain/common';
import { UpdateUserCommand, UserRepository, UserUpdatedEvent } from '@/domain/user';
import { Inject } from '@nestjs/common';
import { CommandHandler, IEvent } from '@nestjs/cqrs';
import { map, mergeMap, Observable, tap } from 'rxjs';

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler extends BaseCommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(InjectionConstant.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(InjectionConstant.EVENT_DISPATCHER)
    private readonly dispatcher: EventDispatcher,
  ) {
    super();
  }

  handle(command: UpdateUserCommand): Observable<void> {
    const { userId, name, email, profilePictureUrl } = command;
    return this.userRepository.findById(userId).pipe(
      throwIfVoid(() => NotFound.of('User', userId.toString())),
      map((user) => {
        const updates = [
          name !== undefined && user.updateName(name),
          email !== undefined && user.updateEmail(email),
          profilePictureUrl !== undefined && user.updateProfilePictureUrl(profilePictureUrl),
        ].filter((value): value is Result<void> => Boolean(value));

        if (updates.length === 0) throw new BadRequest(DomainErrorCode.USER_NO_UPDATE_FIELDS);

        return Result.combine(updates)
          .validate(
            () => user.isActive(),
            () => new BadRequest(DomainErrorCode.USER_DELETED),
          )
          .map(() => {
            const { id, name, email, profilePictureUrl, updatedAt } = user;
            const event = new UserUpdatedEvent(id.toString(), name, email, profilePictureUrl, <Date>updatedAt);
            user.apply(event);
            return user;
          })
          .getOrThrow();
      }),
      mergeMap((user) => this.userRepository.updateOne(user).pipe(map(() => user.getUncommittedEvents()))),
      retryOn({ maxAttempts: 3, minBackoff: 1000, instancesOf: [OptimisticLockingException] }),
      tap((events: IEvent[]) => this.dispatcher.dispatchEventsAsync(events)),
      mapToVoid(),
    );
  }
}
