import { Transaction } from '@/domain/common';
import { Observable } from 'rxjs';

export interface TransactionService {
  start(): Observable<Transaction>;

  commit(transaction: Transaction): Observable<void>;

  rollback(transaction: Transaction): Observable<void>;

  runInTransaction<T>(action: (transaction: Transaction) => Observable<T>): Observable<void>;
}
