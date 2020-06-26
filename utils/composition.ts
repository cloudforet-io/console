export const makeByPassListeners = (listeners: Record<string, Function | Function[]>, name: string, ...args: any[]) => {
    // @ts-ignore
    if (Array.isArray(listeners[name])) listeners[name].forEach(f => f(...args));
    // @ts-ignore
    else if (typeof listeners[name] === 'function') listeners[name](...args);
};
