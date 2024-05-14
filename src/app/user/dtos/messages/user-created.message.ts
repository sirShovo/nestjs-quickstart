import { Expose } from 'class-transformer';

export class UserCreatedMessage {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose({ name: 'created_at' })
  createdAt?: string;
}
