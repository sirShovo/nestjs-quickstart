import { IdService } from '@/app/common';
import { Id } from '@/domain/common';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class MongoIdService implements IdService {
  generate(): Id {
    return Id.load(new Types.ObjectId().toString());
  }
}
