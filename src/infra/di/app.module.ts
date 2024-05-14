import { AppConfig, appConfig, loadConfig } from '@/app/common';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PubSubModule } from '@softrizon/gcp-pubsub';

import { CommonModule } from './common.module';
import { HealthModule } from './health.module';
import { UserModule } from './user.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: false, load: [loadConfig] }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/example-service'),
    // MongooseModule.forRoot(appConfig.config.mongo.uri),
    PubSubModule.forRoot(appConfig.config.pubsub),
    CommonModule,
    HealthModule,
    UserModule,
  ],
  controllers: [],
  providers: [{ provide: AppConfig, useValue: appConfig }],
  exports: [AppConfig, CommonModule],
})
export class AppModule {}
