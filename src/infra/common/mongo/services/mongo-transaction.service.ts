import { TransactionService } from '@/app/common';
import { mapToVoid, Transaction } from '@/domain/common';
import { Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { delayWhen, finalize, firstValueFrom, map, mergeMap, Observable, of, tap } from 'rxjs';

import { MongoTransaction } from '../mongo-transaction';

export class MongoTransactionService implements TransactionService {
  private readonly logger = new Logger(MongoTransactionService.name);
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  start(): Observable<Transaction> {
    return of(null).pipe(
      mergeMap(() => this.connection.startSession()),
      map((session) => new MongoTransaction(session)),
      delayWhen((transaction) => transaction.start()),
    );
  }

  commit(transaction: Transaction): Observable<void> {
    return of(transaction).pipe(mergeMap((trasaction) => trasaction.commit()));
  }

  rollback(transaction: Transaction): Observable<void> {
    return of(transaction).pipe(mergeMap((transaction) => transaction.rollback()));
  }

  runInTransaction<T>(action: (transaction: Transaction) => Observable<T>): Observable<void> {
    let transaction: MongoTransaction;
    return of(null).pipe(
      mergeMap(() => this.connection.startSession()),
      map((session) => new MongoTransaction(session)),
      tap((_transaction) => (transaction = _transaction)),

      delayWhen<MongoTransaction>((transaction) =>
        transaction.mongoSession.withTransaction(() => firstValueFrom(action(transaction))),
      ),
      mapToVoid(),
      finalize(
        () =>
          transaction &&
          transaction.mongoSession
            .endSession()
            .catch((error) => this.logger.debug('Failed while trying to end session', error.stack)),
      ),
    );
  }
}
