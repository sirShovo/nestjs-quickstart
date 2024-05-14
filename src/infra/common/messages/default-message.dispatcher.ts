import { MessageDispatcher } from '@/app/common';
import { InvalidValueException } from '@/domain/common';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ICommand, IQuery } from '@nestjs/cqrs';
import { CqrsOptions } from '@nestjs/cqrs/dist/interfaces/cqrs-options.interface';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { mergeMap, Observable, of, throwError } from 'rxjs';

@Injectable()
export class DefaultMessageDispatcher implements MessageDispatcher {
  private readonly handlers: CqrsOptions;
  constructor(private readonly explorer: ExplorerService, private readonly moduleRef: ModuleRef) {
    this.handlers = this.explorer.explore();
  }

  dispatchQuery<R>(query: IQuery): Observable<R> {
    return of(query).pipe(
      mergeMap((query) => {
        const queryHandlers = this.handlers.queries;
        const queryHandler = queryHandlers?.find(
          (handler) => query instanceof Reflect.getMetadata('__queryHandler__', handler),
        );

        if (!queryHandler) return throwError(() => new InvalidValueException(query, 'Query handler not found'));

        return this.moduleRef.get(queryHandler, { strict: false }).execute(query);
      }),
      mergeMap((result: Observable<R>) => result),
    );
  }

  dispatchCommand<R>(command: ICommand): Observable<R> {
    return of(command).pipe(
      mergeMap((command) => {
        const commandHandlers = this.handlers.commands;
        const commandHandler = commandHandlers?.find(
          (handler) => command instanceof Reflect.getMetadata('__commandHandler__', handler),
        );

        if (!commandHandler) return throwError(() => new InvalidValueException(command, 'Command handler not found'));

        return this.moduleRef.get(commandHandler, { strict: false }).execute(command);
      }),
      mergeMap((obsevable: Observable<R>) => obsevable),
    );
  }
}
