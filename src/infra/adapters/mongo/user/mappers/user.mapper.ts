import { Id } from '@/domain/common';
import { User } from '@/domain/user';
import { AbstractMapper } from '@/infra/common';
import { Types } from 'mongoose';

import { UserDocument } from '../documents';

export class UserMapper extends AbstractMapper<UserDocument, User> {
  map(from: UserDocument): User {
    const UserInstance = class extends User {
      static load(): User {
        return new User(
          Id.load(from._id.toString()),
          from.name,
          from.email,
          from.profile_picture_url,
          from.created_at,
          from.updated_at,
          from.deleted_at,
          from.version,
        );
      }
    };
    return UserInstance.load();
  }
  reverseMap(from: User): UserDocument {
    const doc = new UserDocument();

    doc._id = new Types.ObjectId(from.id.toString());

    doc.name = from.name;
    doc.email = from.email;
    doc.created_at = from.createdAt;
    doc.profile_picture_url = from.profilePictureUrl;
    doc.updated_at = from.updatedAt;
    doc.deleted_at = from.deletedAt;
    doc.version = from.version ?? 0;
    return doc;
  }
}
