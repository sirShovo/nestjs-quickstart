import { Expose } from 'class-transformer';

export class UserDeletedMessage {
  @Expose()
  id: string;
}
