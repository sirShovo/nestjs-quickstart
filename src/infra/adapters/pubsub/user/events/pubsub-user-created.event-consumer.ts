import { appConfig, SubscriptionKey } from '@/app/common';
import { UserCreatedMessage } from '@/app/user';
import { UserDuplicated } from '@/domain/common';
import { CreateUserCommand } from '@/domain/user';
import { AbstractPubSubEventConsumer, MappedData } from '@/infra/common';
import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Message, SubscriptionHandler } from '@softrizon/gcp-pubsub';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';

@Controller()
export class PubSubUserCreatedEventConsumer extends AbstractPubSubEventConsumer {
  @SubscriptionHandler(appConfig.config.pubsub.getSubscription(SubscriptionKey.USER_CREATED))
  handle(@Payload() message: Message, @MappedData() data: UserCreatedMessage): Observable<void> {
    return of(data).pipe(
      map((payload) => {
        const { id, name, email, createdAt } = payload;
        return CreateUserCommand.create(id, name, email, createdAt).getOrThrow();
      }),
      mergeMap((command) => this.messageDispatcher.dispatchCommand<void>(command)),
      map(() => this.ok(message)),
      catchError((error) => of(this.handleError(message, error))),
    );
  }

  protected handleError(message: Message, error: Error): void {
    if (error instanceof UserDuplicated) {
      this.logger.log('User already exists. Skipping...');
      return this.ok(message);
    }

    return super.handleError(message, error);
  }
}
