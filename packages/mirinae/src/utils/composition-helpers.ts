/**
 * Event listeners by pass
 * @param listeners
 * @param name
 * @param event params
 */
export const makeByPassListeners = (listeners: Record<string, any | any[]>, name: string, ...args: any[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (Array.isArray(listeners[name])) listeners[name].forEach((f) => f(...args));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    else if (typeof listeners[name] === 'function') listeners[name](...args);
};
