import { UpdateUserRequest } from '@/app/user';
import { UpdateUserCommand } from '@/domain/user';
import { AbstractHttpResource, MappedBody } from '@/infra/common';
import { Controller, Put, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';

@Controller('v1/admin/users')
export class UpdateUserResource extends AbstractHttpResource {
  @Put()
  handle(@Req() req: Request, @Res() res: Response, @MappedBody() body: UpdateUserRequest): Observable<Response> {
    return of(body).pipe(
      map((data) => {
        const { name, email, profilePictureUrl } = data;
        const userId = this.getCurrentUserId(req);
        return UpdateUserCommand.create(userId, name, email, profilePictureUrl).getOrThrow();
      }),
      mergeMap((command) => this.messageDispatcher.dispatchCommand<void>(command)),
      map(() => this.noContent(res)),
      catchError((error) => of(this.handleError(req, res, error))),
    );
  }
}
