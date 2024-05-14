import { PubSubUserCreatedEventConsumer } from './pubsub-user-created.event-consumer';
import { PubSubUserDeletedEventConsumer } from './pubsub-user-deleted.event-consumer';
import { PubsubUserUpdatedEventPublisher } from './pubsub-user-updated.event-publisher';

export * from './pubsub-user-created.event-consumer';
export * from './pubsub-user-deleted.event-consumer';
export * from './pubsub-user-updated.event-publisher';

export const PubsubUserEventConsumers = [PubSubUserCreatedEventConsumer, PubSubUserDeletedEventConsumer];

export const PubsubUserEventPublishers = [PubsubUserUpdatedEventPublisher];
