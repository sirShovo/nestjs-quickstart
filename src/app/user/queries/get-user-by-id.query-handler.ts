import { BaseQueryHandler, InjectionConstant } from '@/app/common';
import { NotFound } from '@/domain/common';
import { GetUserByIdQuery } from '@/domain/user';
import { UserDocument } from '@/infra/adapters';
import { QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { map, mergeMap, Observable, of } from 'rxjs';

import { UserResponse } from '../dtos';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler extends BaseQueryHandler<GetUserByIdQuery, UserResponse> {
  constructor(
    @InjectModel(InjectionConstant.USER_MODEL)
    private readonly userModel: Model<UserDocument>,
  ) {
    super();
  }

  handle(query: GetUserByIdQuery): Observable<UserResponse> {
    return of(query).pipe(
      map((query) => new Types.ObjectId(query.id.toString())),
      mergeMap((_id) => this.userModel.findOne({ _id })),
      map((userOrNull) => {
        if (!userOrNull) throw NotFound.of('User', query.id.toString());

        return plainToInstance(UserResponse, userOrNull, { excludeExtraneousValues: true });
      }),
    );
  }
}
