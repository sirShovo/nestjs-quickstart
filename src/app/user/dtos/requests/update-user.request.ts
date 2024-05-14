import { Expose } from 'class-transformer';

export class UpdateUserRequest {
  @Expose()
  name?: string;

  @Expose()
  email?: string;

  @Expose({ name: 'profile_picture_url' })
  profilePictureUrl?: string;
}
