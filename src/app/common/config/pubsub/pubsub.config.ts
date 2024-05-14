import { InvalidValueException, Optional } from '@/domain/common';
import { PubSubServerOptions } from '@softrizon/gcp-pubsub';

import { MessageKey, SubscriptionKey } from '../constants';
import { MessageConfig, SubscriptionConfig, TopicConfig } from './topic.config';

export interface MessageValue {
  readonly topic: string;
  readonly message: string;
}
export interface SubscriptionValue {
  readonly topic: string;
  readonly subscription: string;
}

export class GooglePubSubConfig implements PubSubServerOptions {
  private readonly messages: Map<MessageKey, MessageValue> = new Map();
  private readonly subscriptions: Map<SubscriptionKey, SubscriptionValue> = new Map();

  constructor(public readonly config: PubSubServerOptions['config'], public readonly topics: TopicConfig[]) {}

  getMessage(key: MessageKey): MessageValue {
    if (this.messages.has(key)) return <MessageValue>this.messages.get(key);

    const topic = this.topics.find((topic) => topic.messages.some((m) => m.key === key));
    if (!topic) throw new InvalidValueException(key, `Message ${key} not found in any topic`);

    const message = <MessageConfig>topic.messages.find((m) => m.key === key);
    const data = <MessageValue>{ topic: topic.topic, message: message.message };
    this.messages.set(key, data);
    return data;
  }

  getSubscription(key: SubscriptionKey): SubscriptionValue {
    if (this.subscriptions.has(key)) return <SubscriptionValue>this.subscriptions.get(key);

    const topic = this.topics.find((topic) => topic.subscriptions.some((sub) => sub.key === key));
    if (!topic) throw new InvalidValueException(key, `Subscription ${key} not found in any topic`);

    const subscription = <SubscriptionConfig>topic.subscriptions.find((sub) => sub.key === key);
    const data = <SubscriptionValue>{ topic: topic.topic, subscription: subscription.subscription };
    this.subscriptions.set(key, data);
    return data;
  }

  static load(config: Optional<Record<string, any>>): GooglePubSubConfig {
    const pubsub = config.getFromObject('cloud').getFromObject('gcp').getFromObject('pubsub');
    return new GooglePubSubConfig(
      pubsub.getFromObject('config').orElse({}),
      pubsub
        .getFromObject('topics')
        .map((topics: any[], parent) =>
          topics.map((topic, index) => TopicConfig.createFromOptional(parent.traced(topic, index))),
        )
        .getOrThrow(),
    );
  }
}
