import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoServerError } from 'mongodb';
import { Model, Types } from 'mongoose';
import { map, mergeMap, Observable, of, throwError } from 'rxjs';

import { InjectionConstant } from '@/app/common';
import {
  BadRequest,
  catchInstanceOf,
  DomainErrorCode,
  Id,
  mapToVoid,
  OptimisticLockingException,
  throwIfVoid,
  UserDuplicated,
} from '@/domain/common';
import { User, UserRepository } from '@/domain/user';
import { MONGO_ERRORS } from '@/infra/common';

import { UserDocument } from '../documents';
import { UserMapper } from '../mappers';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel(InjectionConstant.USER_MODEL)
    private readonly userModel: Model<UserDocument>,
    private readonly userMapper: UserMapper,
  ) {}

  createOne(user: User): Observable<void> {
    return of(user).pipe(
      map((user) => this.userMapper.reverseMap(user)),
      mergeMap((userDocument) => this.userModel.create(userDocument)),
      mapToVoid(),
      catchInstanceOf(MongoServerError, (error) => {
        if (error.code === MONGO_ERRORS.DUPLICATED_KEY) return throwError(() => new UserDuplicated());
        return throwError(() => error);
      }),
    );
  }
  updateOne(user: User): Observable<void> {
    return of(user).pipe(
      map((user) => this.userMapper.reverseMap(user)),
      mergeMap((userDocument) => {
        const { _id, version, ...update } = userDocument;
        return this.userModel.findOneAndUpdate({ _id, version }, update, { runValidators: true, new: true });
      }),
      throwIfVoid(() => {
        const message = `Version error, User not found for [Id:${user.id.toString()}], and [version:${user.version}]`;
        return new OptimisticLockingException(message);
      }),
      catchInstanceOf(MongoServerError, (error) => {
        if (error.code === MONGO_ERRORS.DUPLICATED_KEY)
          return throwError(() => new BadRequest(DomainErrorCode.USER_EMAIL_INVALID));
        return throwError(() => error);
      }),
      mapToVoid(),
    );
  }

  findById(id: Id): Observable<Nullable<User>> {
    return of(id).pipe(
      map((id) => new Types.ObjectId(id.toString())),
      mergeMap((_id) => this.userModel.findOne({ _id })),
      map((user) => user && this.userMapper.map(user)),
    );
  }
}
