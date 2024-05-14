import { ExposeId, TransformDate } from '@/infra/common';
import { Expose } from 'class-transformer';

export class UserResponse {
  @ExposeId({ name: '_id' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  profile_picture_url: string | null;

  @Expose()
  @TransformDate('YYYY-MM-DD')
  created_at: string;
}
