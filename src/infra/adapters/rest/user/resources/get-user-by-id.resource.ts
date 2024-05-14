import { UserResponse } from '@/app/user';
import { GetUserByIdQuery } from '@/domain/user';
import { AbstractHttpResource } from '@/infra/common';
import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';

@Controller('v1/users/:user_id')
export class GetUserByIdResource extends AbstractHttpResource {
  @Get()
  handle(@Req() req: Request, @Res() res: Response, @Param('user_id') userId: string): Observable<Response> {
    return of(userId).pipe(
      map((id) => GetUserByIdQuery.create(id).getOrThrow()),
      mergeMap((command) => this.messageDispatcher.dispatchQuery<UserResponse>(command)),
      map((data) => this.ok(res, data)),
      catchError((error) => of(this.handleError(req, res, error))),
    );
  }
}
