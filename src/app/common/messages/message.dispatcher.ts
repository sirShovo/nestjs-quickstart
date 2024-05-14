import { ICommand, IEvent, IQuery } from '@nestjs/cqrs';
import { Observable } from 'rxjs';

export type Events = IEvent | IEvent[];

export interface EventDispatcher {
  dispatchEvents(...events: Events[]): Observable<void>;
  dispatchEventsAsync(...events: Events[]): void;
}
export interface CommandDispatcher {
  dispatchCommand<R>(command: ICommand): Observable<R>;
}
export interface QueryDispatcher {
  dispatchQuery<R>(query: IQuery): Observable<R>;
}

export interface MessageDispatcher extends CommandDispatcher, QueryDispatcher {}
