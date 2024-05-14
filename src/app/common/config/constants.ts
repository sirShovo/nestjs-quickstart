import { LogLevel } from '@nestjs/common';

export const enum InjectionConstant {
  USER_MODEL = 'User',
  USER_REPOSITORY = 'UserRepository',
  ID_SERVICE = 'IdService',
  TRANSACTION_SERVICE = 'TransactionService',

  EVENT_DISPATCHER = 'EventDispatcher',
  MESSAGE_DISPATCHER = 'MessageDispatcher',
}

export const enum CollectionNames {
  USER = 'users',
}

export const enum ENVIROMENTS {
  DEV = 'dev',
  PROD = 'prod',
  TEST = 'test',
}

export const PROD_LOG_LEVEL: LogLevel[] = ['warn', 'error'];
export const DEV_LOG_LEVEL: LogLevel[] = ['debug', 'log', ...PROD_LOG_LEVEL]; //'verbose',

export const HEADER_REQUEST_ID = 'Request-Id';
export const HEADER_USER_ID = 'x-user-id';

export const enum SubscriptionKey {
  USER_CREATED = 'test-user-created',
  USER_DELETED = 'test-user-deleted',
}

export const enum MessageKey {
  USER_UPDATED = 'test-user-updated',
}
