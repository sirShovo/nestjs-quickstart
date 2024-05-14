import { AppConfig, BaseEventHandler, MessageKey, MessageValue } from '@/app/common';
import { UserUpdatedEvent } from '@/domain/user';
import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { PubSubService } from '@softrizon/gcp-pubsub';
import { mergeMap, Observable, of, tap } from 'rxjs';

@EventsHandler(UserUpdatedEvent)
export class PubsubUserUpdatedEventPublisher extends BaseEventHandler<UserUpdatedEvent> {
  private readonly logger = new Logger(PubsubUserUpdatedEventPublisher.name);
  private readonly emitted: MessageValue;
  constructor(private readonly pubsub: PubSubService, app: AppConfig) {
    super();
    this.emitted = app.config.pubsub.getMessage(MessageKey.USER_UPDATED);
  }

  handle(event: UserUpdatedEvent): Observable<void> {
    return of(event).pipe(
      mergeMap(() => {
        const { id, name, email, updatedAt, profilePictureUrl } = event;
        const data = { id, name, email, updated_at: updatedAt.toISOString(), profile_picture_url: profilePictureUrl };

        const { topic, message } = this.emitted;
        return this.pubsub.emit<void>({ topic, message, data });
      }),
      tap(() =>
        this.logger.debug(`User updated event [${this.emitted.topic}:${this.emitted.message}] emited to pubsub`),
      ),
    );
  }
}
