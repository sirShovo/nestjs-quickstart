import { Optional } from '@/domain/common';

export class TopicConfig {
  constructor(
    public readonly topic: string,
    public readonly messages: MessageConfig[],
    public readonly subscriptions: SubscriptionConfig[],
  ) {}

  static createFromOptional(config: Optional<Partial<TopicConfig>>): TopicConfig {
    return new TopicConfig(
      config.getFromObjectOrThrow('topic'),
      config
        .getFromObject('messages')
        .map((messages, parent) =>
          messages.map((message, index) => MessageConfig.createFromOptional(parent.traced(message, index))),
        )
        .getOrThrow(),
      config
        .getFromObject('subscriptions')
        .map((subs, parent) =>
          subs.map((sub, index) => SubscriptionConfig.createFromOptional(parent.traced(sub, index))),
        )
        .getOrThrow(),
    );
  }
}

export class SubscriptionConfig {
  constructor(public readonly key: string, public readonly subscription: string) {}

  static createFromOptional(config: Optional<Partial<SubscriptionConfig>>): SubscriptionConfig {
    return new SubscriptionConfig(config.getFromObjectOrThrow('key'), config.getFromObjectOrThrow('subscription'));
  }
}

export class MessageConfig {
  constructor(public readonly key: string, public readonly message: string) {}

  static createFromOptional(config: Optional<Partial<MessageConfig>>): MessageConfig {
    return new MessageConfig(config.getFromObjectOrThrow('key'), config.getFromObjectOrThrow('message'));
  }
}
