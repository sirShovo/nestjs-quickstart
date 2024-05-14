import { BaseEventHandler } from '@/app/common';
import { UserDeletedEvent } from '@/domain/user';
import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { map, Observable, of } from 'rxjs';

@EventsHandler(UserDeletedEvent)
export class UserDeletedEventHandler extends BaseEventHandler<UserDeletedEvent> {
  private readonly logger = new Logger(UserDeletedEventHandler.name);

  handle(event: UserDeletedEvent): Observable<void> {
    return of(event).pipe(
      map((event) => {
        const { id, name, email, deletedAt } = event;
        const data = { id, name, email, deleted_at: deletedAt.toISOString() };

        this.logger.debug(`Side effect processed for User Deleted event with data:\n${JSON.stringify(data, null, 2)}`);
      }),
    );
  }
}
