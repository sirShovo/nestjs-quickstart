import { BaseEventHandler, EventDispatcher, Events } from '@/app/common';
import { DomainError, InvalidValueException, mapToVoid } from '@/domain/common';
import { Injectable, Logger, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IEvent } from '@nestjs/cqrs';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { catchError, mergeMap, Observable, of, throwError, zip } from 'rxjs';

@Injectable()
export class DefaultEventDispatcher implements EventDispatcher {
  private readonly logger = new Logger(DefaultEventDispatcher.name);

  private readonly eventHandlers = new Map<IEvent, BaseEventHandler<IEvent>[]>();

  constructor(private readonly explorer: ExplorerService, private readonly moduleRef: ModuleRef) {}

  dispatchEventsAsync(...events: Events[]): void {
    const handleError = (error: Error) => {
      const message = (error instanceof DomainError ? `[Code: ${error.code}] ` : '') + error.message;
      this.logger.error(message, error?.stack || error);
      return of(void 0);
    };
    of(...this.getObservables(...events))
      .pipe(mergeMap((observable) => observable.pipe(catchError(handleError))))
      .subscribe();
  }

  dispatchEvents(...events: Events[]): Observable<void> {
    return zip(this.getObservables(...events)).pipe(mapToVoid());
  }

  private getObservables(...events: Events[]): Observable<void>[] {
    return events
      .flat()
      .map((event) => {
        const handlers = this.getHandlersFor(event);

        if (!handlers)
          return throwError(() => new InvalidValueException(event.constructor.name, 'No event handlers found'));

        return handlers.map((handler) => handler.handle(event));
      })
      .flat();
  }

  private getHandlersFor(event: IEvent): BaseEventHandler<IEvent>[] | undefined {
    const eventClass = event.constructor;

    const eventHandler = this.eventHandlers.get(eventClass);
    if (eventHandler) return eventHandler;

    const { events: handlers = [] } = this.explorer.explore();

    const foundHandlers: BaseEventHandler<IEvent>[] = [];
    for (const handler of handlers) {
      const handledEventClasses = <Type<IEvent>[]>Reflect.getMetadata('__eventsHandler__', handler);
      const isHandler = handledEventClasses.some((eventClass) => event instanceof eventClass);
      if (!isHandler) continue;

      foundHandlers.push(<BaseEventHandler<IEvent>>this.moduleRef.get(handler, { strict: false }));
    }

    if (foundHandlers.length === 0) return;

    this.eventHandlers.set(eventClass, foundHandlers);

    return foundHandlers;
  }
}
