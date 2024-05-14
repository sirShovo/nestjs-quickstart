import { BaseCommandHandler, EventDispatcher, InjectionConstant } from '@/app/common';
import { mapToVoid } from '@/domain/common';
import { CreateUserCommand, User, UserRepository } from '@/domain/user';
import { Inject } from '@nestjs/common';
import { CommandHandler, IEvent } from '@nestjs/cqrs';
import { map, mergeMap, Observable, of, tap } from 'rxjs';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler extends BaseCommandHandler<CreateUserCommand> {
  constructor(
    @Inject(InjectionConstant.USER_REPOSITORY)
    private readonly repository: UserRepository,
    @Inject(InjectionConstant.EVENT_DISPATCHER)
    private readonly dispatcher: EventDispatcher,
  ) {
    super();
  }

  handle(command: CreateUserCommand): Observable<void> {
    return of(command).pipe(
      map((command) => {
        const { id, name, email, createdAt } = command;
        return User.create(id, name, email, createdAt.toISOString()).getOrThrow();
      }),
      mergeMap((user) => this.repository.createOne(user).pipe(map(() => user.getUncommittedEvents()))),
      tap((events: IEvent[]) => this.dispatcher.dispatchEventsAsync(events)),
      mapToVoid(),
    );
  }
}
