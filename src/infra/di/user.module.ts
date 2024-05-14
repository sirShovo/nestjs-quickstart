import { InjectionConstant } from '@/app/common';
import { UserCommandHandlers, UserEventHandlers, UserQueryHandlers } from '@/app/user';
import {
  AdminUserResources,
  MongoUserRepository,
  PubsubUserEventConsumers,
  PubsubUserEventPublishers,
  UserMappers,
  UserResources,
  UserSchema,
} from '@/infra/adapters';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: InjectionConstant.USER_MODEL, schema: UserSchema }])],
  controllers: [...UserResources, ...AdminUserResources, ...PubsubUserEventConsumers],
  providers: [
    ...PubsubUserEventPublishers,
    ...UserCommandHandlers,
    ...UserQueryHandlers,
    ...UserEventHandlers,
    ...UserMappers,
    { provide: InjectionConstant.USER_REPOSITORY, useClass: MongoUserRepository },
  ],
  exports: [],
})
export class UserModule {}
