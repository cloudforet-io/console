// support desktop and mobile
// support start, move, end

const events = {
    start: ['mousedown', 'touchstart'],
    move: ['mousemove', 'touchmove'],
    end: ['mouseup', 'touchend'],
};
export type MouseOrTouchEvent = MouseEvent | TouchEvent
export interface EventPosition {
  pageX: number;
  pageY: number;
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
}

export interface Options {
  args?: any[];
  mouseArgs?: any[];
  touchArgs?: any[];
}

const DragEventService = {
    isTouch(e: MouseEvent | TouchEvent) {
        return e.type && e.type.startsWith('touch');
    },
    _getStore(el: Element | Document | Window) {
    // @ts-ignore
        if (!el._wrapperStore) {
            // @ts-ignore
            el._wrapperStore = [];
        }
        // @ts-ignore
        return el._wrapperStore;
    },
    on<T>(
        el: Element | Document | Window,
        name: string,
        handler: (
      event: MouseEvent | TouchEvent,
      eventPosition: EventPosition
    ) => T,
        options?: Options,
    ) {
        const { args, mouseArgs, touchArgs } = resolveOptions(options);
        const store = this._getStore(el);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const ts = this;
        const wrapper = function (e) {
            let mouse;
            const isTouch = ts.isTouch(e);
            if (isTouch) {
                // touch
                mouse = {
                    x: e.changedTouches[0].pageX,
                    y: e.changedTouches[0].pageY,
                    pageX: e.changedTouches[0].pageX,
                    pageY: e.changedTouches[0].pageY,
                    clientX: e.changedTouches[0].clientX,
                    clientY: e.changedTouches[0].clientY,
                    screenX: e.changedTouches[0].screenX,
                    screenY: e.changedTouches[0].screenY,
                };
            } else {
                // mouse
                mouse = {
                    x: e.pageX,
                    y: e.pageY,
                    pageX: e.pageX,
                    pageY: e.pageY,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    screenX: e.screenX,
                    screenY: e.screenY,
                };
                if (name === 'start' && e.which !== 1) {
                    // not left button mousedown
                    return;
                }
            }
            // @ts-ignore
            // eslint-disable-next-line consistent-return
            return handler.call(this, e, mouse);
        };
        store.push({ handler, wrapper });
        // follow format will cause big bundle size
        // on(el, events[name][0], wrapper, ...args)
        on.call(null, el, events[name][0], wrapper, ...[...args, ...mouseArgs]);
        on.call(null, el, events[name][1], wrapper, ...[...args, ...touchArgs]);
    },
    off(
        el: Element | Document | Window,
        name: string,
        handler: any,
        options?: Options,
    ) {
        const { args, mouseArgs } = resolveOptions(options);
        const store = this._getStore(el);
        for (let i = store.length - 1; i >= 0; i--) {
            const { handler: handler2, wrapper } = store[i];
            if (handler === handler2) {
                off.call(
                    null,
                    el,
                    events[name][0],
                    wrapper,
                    ...[...args, ...mouseArgs],
                );
                off.call(
                    null,
                    el,
                    events[name][1],
                    wrapper,
                    ...[...args, ...mouseArgs],
                );
                store.splice(i, 1);
            }
        }
    },
};

export default DragEventService;

function resolveOptions(options: Record<string, any> = {}) {
    const args = options.args || [];
    const mouseArgs = options.mouseArgs || [];
    const touchArgs = options.touchArgs || [];
    return { args, mouseArgs, touchArgs };
}


/**
 * cancel event listener on element
 * @param el
 * @param name
 * @param handler
 * @param options
 */
function off<T extends Event>(
    el: Node | Window | Document,
    name: string,
    handler: (event: T) => void,
    options?: boolean | AddEventListenerOptions,
) {
    if (el.removeEventListener) {
        // All major browsers except IE 8 and earlier
        // @ts-ignore
        el.removeEventListener(name, handler, options);
        // @ts-ignore
    } else if (el.detachEvent) {
        // IE 8 and earlier IE versions
        // @ts-ignore
        el.detachEvent(`on${name}`, handler, options);
    }
}


/**
 * listen event on element
 * @param el
 * @param name
 * @param handler
 * @param options
 */
function on<T extends Event>(
    el: Node | Window | Document,
    name: string,
    handler: (event: T) => void,
    options?: boolean | AddEventListenerOptions,
) {
    if (el.addEventListener) {
        // All major browsers except IE 8 and earlier
        // @ts-ignore
        el.addEventListener(name, handler, options);
        // @ts-ignore
    } else if (el.attachEvent) {
        // IE 8 and earlier IE versions
        // @ts-ignore
        el.attachEvent(`on${name}`, handler, options);
    }
}
