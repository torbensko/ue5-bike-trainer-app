export type EventHandler<EventData> = (data: EventData) => void;

// small super class for event emitters
export class EventEmitter<
  EventName extends string = string,
  EventData = any | undefined
> {
  private listenersMap = new Map<EventName, EventHandler<EventData>[]>();

  public on(eventName: EventName, handler: EventHandler<EventData>) {
    const listeners = this.listenersMap.get(eventName);
    if (listeners === undefined) {
      this.listenersMap.set(eventName, [handler]);
      return;
    }

    listeners.push(handler);
  }

  public off(eventName: EventName, handler: EventHandler<EventData>) {
    const listeners = this.listenersMap.get(eventName);
    if (listeners === undefined) {
      // no one is listening to this, bail
      return;
    }

    this.listenersMap.set(
      eventName,
      listeners.filter((x) => x !== handler)
    );
  }

  public emit(eventName: EventName, eventData?: EventData) {
    const listeners = this.listenersMap.get(eventName);
    if (listeners === undefined) {
      // no one is listening to this, bail
      return;
    }

    listeners.forEach((handler) => {
      // note: could make this faster
      // ensure this listener is still registered
      // listeners are allowed to .off() during previous event handlers
      if (this.listenersMap.get(eventName)!.some((x) => x === handler)) {
        handler(eventData!);
      }
    });
  }

  // for testing purposes
  public numListeners(eventName?: EventName) {
    if (eventName !== undefined) {
      const listeners = this.listenersMap.get(eventName) || [];
      return listeners.length;
    }

    const numListeners = Array.from(this.listenersMap.values()).reduce(
      (acc, val) => {
        return acc + val.length;
      },
      0
    );

    return numListeners;
  }
}
