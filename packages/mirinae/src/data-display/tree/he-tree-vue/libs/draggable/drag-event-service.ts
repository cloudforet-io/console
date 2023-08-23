/* eslint-disable class-methods-use-this */
// support desktop and mobile
// support start, move, end

import type { EventOptions, EventPosition } from '@/data-display/tree/he-tree-vue/libs/draggable/types';

const events = {
    start: ['mousedown', 'touchstart'],
    move: ['mousemove', 'touchmove'],
    end: ['mouseup', 'touchend'],
};


export class DragEventService {
    _wrapperStore: any[];

    constructor() {
        this._wrapperStore = [];
    }

    isTouch(e: MouseEvent | TouchEvent) {
        return e.type && e.type.startsWith('touch');
    }

    on<T>(
        el: Element | Document | Window,
        name: string,
        handler: (
      event: MouseEvent | TouchEvent,
      eventPosition: EventPosition
    ) => T,
        options?: EventOptions,
    ) {
        const { args, mouseArgs, touchArgs } = resolveOptions(options);
        const store = this._wrapperStore;
        const wrapper = (e): T|undefined => {
            let mouse;
            const isTouch = this.isTouch(e);
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
                    return undefined;
                }
            }
            return handler.call(this, e, mouse);
        };
        store.push({ handler, wrapper });
        // follow format will cause big bundle size
        // on(el, events[name][0], wrapper, ...args)
        on.call(null, el, events[name][0], wrapper, ...[...args, ...mouseArgs]);
        on.call(null, el, events[name][1], wrapper, ...[...args, ...touchArgs]);
    }

    off(
        el: Element | Document | Window,
        name: string,
        handler: any,
        options?: EventOptions,
    ) {
        const { args, mouseArgs } = resolveOptions(options);
        const store = this._wrapperStore;
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
    }
}

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
    // eslint-disable-next-line no-undef
    options?: boolean | AddEventListenerOptions,
) {
    el.removeEventListener(name, handler, options);
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
    // eslint-disable-next-line no-undef
    options?: boolean | AddEventListenerOptions,
) {
    el.addEventListener(name, handler, options);
}
