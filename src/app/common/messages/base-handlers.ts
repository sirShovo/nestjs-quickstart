import { ICommand, ICommandHandler, IEvent, IEventHandler, IQuery, IQueryHandler } from '@nestjs/cqrs';
import { Observable } from 'rxjs';

type CommandQueryOrEvent = ICommand | IQuery | IEvent;
export abstract class BaseHandler<TCommandQueryOrEvent extends CommandQueryOrEvent, TResult>
  implements
    ICommandHandler<TCommandQueryOrEvent, Observable<TResult>>,
    IQueryHandler<TCommandQueryOrEvent, Observable<TResult>>,
    IEventHandler<TCommandQueryOrEvent>
{
  async execute(message: TCommandQueryOrEvent): Promise<Observable<TResult>> {
    return this.handle(message);
  }

  abstract handle(message: TCommandQueryOrEvent): Observable<TResult>;
}

export abstract class BaseEventHandler<E extends IEvent> extends BaseHandler<E, void> {}

export abstract class BaseCommandHandler<C extends ICommand, R = void> extends BaseHandler<C, R> {}

export abstract class BaseQueryHandler<Q extends IQuery, R> extends BaseHandler<Q, R> {}
