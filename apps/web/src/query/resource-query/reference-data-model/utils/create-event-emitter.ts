type EventType = string | symbol;

type EventMap = Record<EventType, (...args: any[]) => void>;

export const createEventEmitter = <T extends EventMap>() => {
    const listeners = new Map<keyof T, Array<T[keyof T]>>();

    const on = <K extends EventType>(event: K, listener: T[K]) => {
        if (!listeners.has(event)) {
            listeners.set(event, []);
        }

        listeners.get(event)?.push(listener);
    };

    const off = <K extends EventType>(event: K, listener: T[K]) => {
        const eventListeners = listeners.get(event);

        if (eventListeners) {
            listeners.set(event, eventListeners.filter((_listener) => _listener !== listener));
        }
    };

    const emit = <K extends EventType>(event: K, ...args: Parameters<T[K]>) => {
        const eventListeners = listeners.get(event);

        if (eventListeners) {
            eventListeners.forEach((listener) => listener(...args));
        }
    };

    return { on, off, emit };
};
