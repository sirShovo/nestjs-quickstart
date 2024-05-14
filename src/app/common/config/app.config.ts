import { readFileSync as read } from 'node:fs';

import { Logger, LogLevel } from '@nestjs/common';
import { config } from 'dotenv';
import * as yaml from 'js-yaml';

import { Optional } from '@/domain/common';

import { DEV_LOG_LEVEL, ENVIROMENTS, PROD_LOG_LEVEL } from './constants';
import { GooglePubSubConfig } from './pubsub';

config();
export interface Config {
  app: BaseAppConfig;
  server: ServerConfig;
  mongo: MongoConfig;
  pubsub: GooglePubSubConfig;
}

export interface ServerConfig {
  port: number;
  prefix: string;
}

export interface BaseAppConfig {
  name: string;
  logger: LogLevel[];
  author: string | string[];
}

export interface MongoConfig {
  database: string;
  user: string;
  password: string;
  host: string;
  port: number;
  uri: string;
  options?: string;
}

/**
 * The app configuration deriving from the environment variables.
 *
 * This class uses a singleton pattern to deliver the same configuration. This
 * is practical as-is because it relies heavily on when `ConfigModule.forRoot()`
 * loads the `.env` file. By using a singleton, we ensure that the created instance
 * comes from the config module invoke, which in turn, ensures that the variables
 * are loaded properly and made available both in `ConfigService` and
 * `AppConfig.getInstance().config`.
 *
 * **IMPORTANT**: Do NOT create instances of this class manually. In other words,
 * do not call `loadConfig` directly.
 * @see {@link ConfigModule.forRoot}
 */
export class AppConfig {
  private readonly logger = new Logger(AppConfig.name);
  private static _instance: AppConfig;
  private readonly _config: Config;

  get config(): Config {
    return this._config;
  }

  private constructor() {
    const env = process.env;
    const config = Optional.ofUndefinable(env)
      .getFromObject('SN_CONFIG_PATH')
      .replaceIfEmpty('./.config/config.yaml')
      .map((path) => read(path, 'utf8'))
      .map((yamlString) => <object>yaml.load(yamlString))
      .map((config) => <Record<string, any>>{ ...config, env });

    this._config = {
      app: this.loadAppConfig(config),
      server: this.loadServerConfig(config),
      mongo: this.loadMongoConfig(config),
      pubsub: GooglePubSubConfig.load(config),
    };
  }

  private loadAppConfig(config: Optional<Record<string, any>>): BaseAppConfig {
    const app = config.getFromObject('app');
    const env = config.getFromObject('env');
    return {
      name: <string>app.getFromObjectOrThrow('name'),
      author: <string>app.getFromObjectOrThrow('author'),
      logger: env
        .getFromObject('NODE_ENV')
        .filter((value) => value === ENVIROMENTS.PROD)
        .map(() => PROD_LOG_LEVEL)
        .orElse(DEV_LOG_LEVEL),
    };
  }

  private loadServerConfig(config: Optional<Record<string, any>>): ServerConfig {
    const server = config.getFromObject('server');
    return {
      port: server
        .getFromObject('port')
        .map((value) => parseInt(value, 10))
        .orElse(8080),
      prefix: <string>server.getFromObjectOrThrow('contextPath'),
    };
  }

  private loadMongoConfig(config: Optional<Record<string, any>>): MongoConfig {
    const env = config.getFromObject('env');

    const mongo = {
      database: env.getFromObjectOrThrow('SN_MONGODB_DATABASE_NAME'),
      user: env.getFromObjectOrThrow('SN_MONGODB_USERNAME'),
      password: env.getFromObjectOrThrow('SN_MONGODB_PASSWORD'),
      host: env.getFromObjectOrThrow('SN_MONGODB_HOST'),
      options: env.getFromObject('SN_MONGODB_OPTIONS').orElse(''),
    };
    const uri = `mongodb+srv://${mongo.user}:${mongo.password}@${mongo.host}/${mongo.database}?${mongo.options}`;
    return { ...mongo, port: 27017, uri };
  }

  static getInstance(): AppConfig {
    return this._instance || (this._instance = new this());
  }

  printUsage(): void {
    const { server, app } = this._config;
    this.logger.log(`${app.name} running on port ${server.port}...`);
  }

  printVerbose(): void {
    this.logger.log(`Printing app config: `, AppConfig.name);
  }
}

export const loadConfig = (): Config => AppConfig.getInstance().config;

export const appConfig = AppConfig.getInstance();

export const { pubsub: pubsubConfig, mongo: mongoConfig } = appConfig.config;
