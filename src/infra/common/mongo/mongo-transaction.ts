import { Transaction } from '@/domain/common';
import { ClientSession } from 'mongoose';

export class MongoTransaction implements Transaction {
  constructor(private readonly session: ClientSession) {}

  get mongoSession(): ClientSession {
    return this.session;
  }

  async start(): Promise<void> {
    this.session.startTransaction();
  }
  async commit(): Promise<void> {
    await this.session.commitTransaction();
    await this.session.endSession();
  }
  async rollback(): Promise<void> {
    await this.session.abortTransaction();
    await this.session.endSession();
  }
}
