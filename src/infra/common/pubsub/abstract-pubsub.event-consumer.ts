import { InjectionConstant, MessageDispatcher } from '@/app/common';
import { DomainError } from '@/domain/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message } from '@softrizon/gcp-pubsub';
import { Observable } from 'rxjs';

@Injectable()
export abstract class AbstractPubSubEventConsumer {
  protected readonly logger: Logger;

  constructor(
    @Inject(InjectionConstant.MESSAGE_DISPATCHER)
    protected readonly messageDispatcher: MessageDispatcher,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  abstract handle(message: Message, ...args: any[]): Observable<void>;

  protected handleError(message: Message, error: Error): void {
    const messageId = message?.id;
    const event = message?.attributes?.event;
    const errorCode = error instanceof DomainError ? `[Code: ${error.code}] ` : '';

    const errorMessage = `${errorCode}Unexpected error occurred. [Message-Id: ${messageId}][Event: ${event}]`;
    this.logger.error(errorMessage, error?.stack || error);

    message.nack();
  }

  protected ok(message: Message): void {
    const messageId = message?.id;
    const event = message?.attributes?.event;
    this.logger.log(`Message processed successfully. [Message-Id: ${messageId}][Event: ${event}]`);
    message.ack();
  }
}
