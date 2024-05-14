import { BaseCommandHandler, EventDispatcher, InjectionConstant } from '@/app/common';
import { NotFound, throwIfVoid } from '@/domain/common';
import { DeleteUserCommand, UserRepository } from '@/domain/user';
import { Inject } from '@nestjs/common';
import { CommandHandler, IEvent } from '@nestjs/cqrs';
import { map, mergeMap, Observable, of, tap } from 'rxjs';

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler extends BaseCommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(InjectionConstant.USER_REPOSITORY)
    private readonly repository: UserRepository,
    @Inject(InjectionConstant.EVENT_DISPATCHER)
    private readonly dispatcher: EventDispatcher,
  ) {
    super();
  }

  handle(command: DeleteUserCommand): Observable<void> {
    return of(command).pipe(
      mergeMap(({ id }) => this.repository.findById(id)),
      throwIfVoid(() => NotFound.of('User', command.id.toString())),
      tap((user) => user.markAsDeleted().getOrThrow()),
      mergeMap((user) => this.repository.updateOne(user).pipe(map(() => user.getUncommittedEvents()))),
      mergeMap((events: IEvent[]) => this.dispatcher.dispatchEvents(events)),
    );
  }
}
