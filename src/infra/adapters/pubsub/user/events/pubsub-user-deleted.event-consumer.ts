import { appConfig, SubscriptionKey } from '@/app/common';
import { UserDeletedMessage } from '@/app/user';
import { DomainError, DomainErrorCode } from '@/domain/common';
import { DeleteUserCommand } from '@/domain/user';
import { AbstractPubSubEventConsumer, MappedData } from '@/infra/common';
import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Message, SubscriptionHandler } from '@softrizon/gcp-pubsub';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';

@Controller()
export class PubSubUserDeletedEventConsumer extends AbstractPubSubEventConsumer {
  @SubscriptionHandler(appConfig.config.pubsub.getSubscription(SubscriptionKey.USER_DELETED))
  handle(@Payload() message: Message, @MappedData() data: UserDeletedMessage): Observable<void> {
    const { id } = data;

    return of(id).pipe(
      map((id) => DeleteUserCommand.create(id).getOrThrow()),
      mergeMap((command) => this.messageDispatcher.dispatchCommand<void>(command)),
      map(() => this.ok(message)),
      catchError((error) => of(this.handleError(message, error))),
    );
  }

  protected handleError(message: Message, error: Error): void {
    if (error instanceof DomainError && error.is(DomainErrorCode.USER_ALREADY_DELETED)) {
      this.logger.log('User already deleted. Skipping...');
      return this.ok(message);
    }

    return super.handleError(message, error);
  }
}
