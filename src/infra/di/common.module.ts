import { InjectionConstant } from '@/app/common';
import {
  DefaultEventDispatcher,
  DefaultMessageDispatcher,
  GlobalExceptionFilters,
  GlobalInterceptors,
  MongoIdService,
  MongoTransactionService,
} from '@/infra/common';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [
    ...GlobalExceptionFilters,
    ...GlobalInterceptors,
    ExplorerService,
    { provide: InjectionConstant.MESSAGE_DISPATCHER, useClass: DefaultMessageDispatcher },
    { provide: InjectionConstant.EVENT_DISPATCHER, useClass: DefaultEventDispatcher },
    { provide: InjectionConstant.ID_SERVICE, useClass: MongoIdService },
    { provide: InjectionConstant.TRANSACTION_SERVICE, useClass: MongoTransactionService },
  ],
  exports: [
    CqrsModule,
    InjectionConstant.MESSAGE_DISPATCHER,
    InjectionConstant.EVENT_DISPATCHER,
    InjectionConstant.ID_SERVICE,
    InjectionConstant.TRANSACTION_SERVICE,
  ],
})
export class CommonModule { }
