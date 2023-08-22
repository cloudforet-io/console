import type {
    WalkTreeDataHandler,
    WalkTreeDataOptions,
} from './types';

export function isArray(v: unknown): v is any[] {
    return Object.prototype.toString.call(v) === '[object Array]';
}
export function isObject(v: unknown): v is object {
    return Object.prototype.toString.call(v) === '[object Object]';
}
export function isFunction(v: unknown): v is typeof Function {
    return typeof v === 'function';
}

// source: http://youmightnotneedjquery.com/
export function hasClass(el: Element, className: string) {
    if (el.classList) {
        return el.classList.contains(className);
    }
    return new RegExp(`(^| )${className}( |$)`, 'gi').test(el.className);
}
// source: http://youmightnotneedjquery.com/
export function addClass(el: Element, className: string | string[]) {
    const t = toArrayIfNot(className);
    // eslint-disable-next-line no-restricted-syntax
    for (const _className of t) {
        if (!hasClass(el, _className)) {
            if (el.classList) {
                el.classList.add(_className);
            } else {
                el.className += ` ${_className}`;
            }
        }
    }
}

export function backupAttr(el: Element, name: string) {
    const key = `original_${name}`;
    el[key] = el.getAttribute(name);
}
export function restoreAttr(el: Element, name: string) {
    const key = `original_${name}`;
    const value = el[key];
    if (value == null) {
        el.removeAttribute(name);
    } else {
        el.setAttribute(name, value);
    }
}
export function removeEl(el: Node): Node|undefined {
    if (el.parentNode !== null) {
        return el.parentNode.removeChild(el);
    }
    return undefined;
}


// ## dom

/**
 * return NodeList if there are multiple top-level nodes
 * @param htmlString
 * @returns
 */
export function createElementFromHTML(htmlString: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    if (div.childNodes.length > 1) {
        return div.childNodes;
    }
    return div.childNodes[0];
}
/**
 * NOT RECOMMEND. Use Node.contains instead.
 */
export function isDescendantOf(el: Node, parent: Node): boolean|undefined {
    let element = el;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (element.parentNode == null) {
            return false;
        }
        if (element.parentNode === parent) {
            return true;
        }
        element = element.parentNode;
    }
}


export function assignIfNoKey(obj: object, key: string, val: any) {
    // eslint-disable-next-line no-prototype-builtins
    if (!obj.hasOwnProperty(key)) {
        obj[key] = val;
    }
}
export function assignIfKeyNull(obj: object, key: string, val: any) {
    if (obj[key] == null) {
        obj[key] = val;
    }
}
export function objectAssignIfNoKey<T extends object>(obj1: T, obj2: object) {
    Object.keys(obj2).forEach((key) => {
        assignIfNoKey(obj1, key, obj2[key]);
    });
    return obj1;
}
export function objectAssignIfKeyNull<T extends object>(obj1: T, obj2: object) {
    Object.keys(obj2).forEach((key) => {
        assignIfKeyNull(obj1, key, obj2[key]);
    });
    return obj1;
}
export function toArrayIfNot<T>(arrOrNot: T | T[]): T[] {
    return isArray(arrOrNot) ? arrOrNot : [arrOrNot];
}
/**
 * if it is function, return result, else return it directly.
 * @param valueOrGetter
 * @param args
 * @returns
 */
export function resolveValueOrGetter(valueOrGetter, args: any[] = []) {
    if (isFunction(valueOrGetter)) {
        return valueOrGetter(...args);
    }
    return valueOrGetter;
}


/**
 * return new array excluding n items from end
 * @param arr
 * @param n
 * @returns
 */
export function arrayWithoutEnd<T>(arr: T[], n = 1) {
    return arr.slice(0, arr.length - n);
}

// loop for Array, Object, NodeList, String
export type IterateAllOptions = {
    reverse?: boolean;
    exclude?: (
        info: { value: any; index: number } | { value: any; key: string }
    ) => boolean;
};
export function* iterateAll<T>(
    val: string | any[] | object | NodeList | HTMLCollection,
    opt: IterateAllOptions = {},
): Generator<{ value: T; index?: number; key?: string }> {
    // opt: {reverse, exclude}
    if (!opt.reverse) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (val.length != null) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            for (let i = 0; i < val.length; i++) {
                const info = { value: val[i], index: i };
                if (!opt.exclude || !opt.exclude(info)) {
                    yield info;
                }
            }
        } else if (isObject(val)) {
            // eslint-disable-next-line no-restricted-syntax
            for (const key of Object.keys(val)) {
                const info = { value: val[key], key };
                if (!opt.exclude || !opt.exclude(info)) {
                    yield info;
                }
            }
        } else {
            throw new Error('Unsupported type');
        }
    } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-lonely-if
        if (val.length != null) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            for (let i = val.length - 1; i >= 0; i--) {
                const info = { value: val[i], index: i };
                if (!opt.exclude || !opt.exclude(info)) {
                    yield info;
                }
            }
        } else if (isObject(val)) {
            const keys = Object.keys(val);
            keys.reverse();
            // eslint-disable-next-line no-restricted-syntax
            for (const key of keys) {
                const info = { value: val[key], key };
                if (!opt.exclude || !opt.exclude(info)) {
                    yield info;
                }
            }
        } else {
            throw new Error('Unsupported type');
        }
    }
}


/**
 * must pass arguments to `next` manually
 * @param funcs
 * @returns
 */
export function joinFunctionsByNext(funcs: any[]): (...args: any[]) => any {
    let next = () => {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-restricted-syntax
    for (const { value: func } of iterateAll(funcs, { reverse: true })) {
        const currentNext = next;
        next = wrapFuncWithNext(func, currentNext);
    }
    return next;
    function wrapFuncWithNext(func, _next) {
        return function getFunc(...args: any[]) {
            return func(_next, ...args);
        };
    }
}

/**
 * remove item from array. return removed count
 * @param arr
 * @param v
 * @returns
 */
export const arrayRemove = (arr: any[], v: any) => {
    let index;
    let count = 0;
    // eslint-disable-next-line no-cond-assign
    while ((index = arr.indexOf(v)) > -1) {
        arr.splice(index, 1);
        count++;
    }
    return count;
};

/**
 * rand int in range, including min and max
 * @param min
 * @param max
 * @returns
 */
export function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


/**
 * rand item in array
 * @param arr
 * @returns
 */
export function randChoice<T>(arr: string | T[]): string | T {
    return arr[randInt(0, arr.length - 1)] as T;
}

/**
 * generate random string
 * @param len default 8
 * @param seeds
 * @returns
 */
export function randString(
    len = 8,
    seeds:
        | string
        | string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
) {
    let r = '';
    for (let i = 0; i < len; i++) {
        r += randChoice(seeds);
    }
    return r;
}

/**
 * get last of array
 * @param arr
 * @returns
 */
export function arrayLast<T>(arr: T[]) {
    return arr[arr.length - 1];
}


/**
 * walk tree data by with depth first search. tree data example: `[{children: [{}, {}]}]`
 * @param obj
 * @param handler
 * @param _opt
 */
export function walkTreeData<T>(
    obj: T | T[],
    handler: WalkTreeDataHandler<T>,
    _opt: WalkTreeDataOptions = {},
) {
    const opt = objectAssignIfNoKey(
        { ..._opt },
        {
            childrenKey: 'children',
        },
    );
    const { childrenKey } = opt;
    const rootChildren = isArray(obj) ? obj : [obj];
    //
    class StopException {}
    const func = (_children, parent, parentPath) => {
        let children = _children;
        if (opt.reverse) {
            children = _children.slice();
            children.reverse();
        }
        const len = children.length;
        for (let i = 0; i < len; i++) {
            const item = children[i];
            const index = opt.reverse ? len - i - 1 : i;
            const path = parentPath ? [...parentPath, index] : [];
            if (opt.childFirst && childrenKey !== undefined) {
                if (item[childrenKey] != null) {
                    func(item[childrenKey], item, path);
                }
            }
            const r = handler(item, index, parent, path);
            if (r === false) {
                // stop
                throw new StopException();
            } else if (r === 'skip children') {
                // eslint-disable-next-line no-continue
                continue;
            } else if (r === 'skip siblings') {
                break;
            }
            if (!opt.childFirst && childrenKey !== undefined) {
                if (item[childrenKey] != null) {
                    func(item[childrenKey], item, path);
                }
            }
        }
    };
    try {
        func(rootChildren, null, isArray(obj) ? [] : null);
    } catch (e) {
        if (e instanceof StopException) {
            // stop
        } else {
            throw e;
        }
    }
}



export function findParent<T extends Element>(
    el: T,
    callback: (parentEl: Element) => boolean | 'break' | undefined | void,
    opt: { withSelf?: boolean; until?: Element; withUntil?: boolean } = {},
) {
    let cur = opt && opt.withSelf ? el : el.parentElement;
    while (cur) {
        const shouldBreak = opt.until && cur === opt.until;
        if (shouldBreak && !opt.withUntil) {
            return;
        }
        const r = callback(cur);
        if (r === 'break') {
            return;
        } if (r) {
            // eslint-disable-next-line consistent-return
            return cur;
        } if (shouldBreak) {
            return;
        }
        cur = cur.parentElement;
    }
}

interface MutableDOMRect {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
    x: number;
    y: number;
    toJSON(): any;
}
export function getViewportPosition(el: Element): MutableDOMRect {
    // refer: http://www.51xuediannao.com/javascript/getBoundingClientRect.html
    let rect: MutableDOMRect = el.getBoundingClientRect();
    if (document.documentElement.clientTop > 0) {
        const top = rect.top - document.documentElement.clientTop; // document.documentElement.clientTop. Always 2 in IE67, 0 for other advanced point browsers
        const bottom = rect.bottom;
        const left = rect.left - document.documentElement.clientLeft; // document.documentElement.clientLeft. Always 2 in IE67, 0 for other advanced point browsers
        const right = rect.right;
        const width = rect.width || right - left; // IE67 does not exist width use right - left to get
        const height = rect.height || bottom - top;
        const x = left;
        const y = top;
        const json = {
            top, right, bottom, left, width, height, x, y,
        };
        rect = { ...json, toJSON: () => json };
    }
    return rect;
}


/**
 * relative to page root element(document.documentElement). refer: https://gist.github.com/aderaaij/89547e34617b95ac29d1
 * @param el
 * @returns
 */
export function getOffset(el: Element) {
    const rect = getViewportPosition(el);
    const t = getViewportPosition(document.documentElement);

    return {
        x: rect.left - t.left,
        y: rect.top - t.top,
    };
}


/* scroll to a position with duration
from https://gist.github.com/andjosh/6764939
interface options{
  x: number // nullable. don't scroll horizontally when null
  y: number // nullable. don't scroll vertically when null
  duration: number // default 0
  element: Node // default is the top scrollable element.
  beforeEveryFrame: (count: number) => boolean|void // call before requestAnimationFrame execution. return false to stop
}
return stop
*/
export function scrollTo(options: {
    x?: number;
    y?: number;
    duration?: number;
    element?: Element;
    beforeEveryFrame?: (count: number) => boolean | void; // return false to stop
}) {
    if (!options.element) {
        options.element = document.scrollingElement || document.documentElement;
    }
    if (options.duration == null) {
        options.duration = 0;
    }
    const {
        x, y, duration, element,
    } = options;
    let requestAnimationFrameId;
    let count = 0;
    const startY = element.scrollTop;
    const changeY = (y ?? 0) - startY;
    const startX = element.scrollLeft;
    const changeX = (x ?? 0) - startX;
    const startDate = +new Date();
    const animateScroll = function animateScroll() {
        if (
            options.beforeEveryFrame
                && options.beforeEveryFrame(count) === false
        ) {
            return;
        }
        const currentDate = new Date().getTime();
        const changedTime = currentDate - startDate;
        if (y != null) {
            element.scrollTop = parseInt(
                calc(startY, changeY, changedTime, duration),
            );
        }
        if (x != null) {
            element.scrollLeft = parseInt(
                calc(startX, changeX, changedTime, duration),
            );
        }
        if (changedTime < duration) {
            requestAnimationFrameId = requestAnimationFrame(animateScroll);
        } else {
            if (y != null) {
                element.scrollTop = y;
            }
            if (x != null) {
                element.scrollLeft = x;
            }
        }
        count++;
    };
    const stop = () => {
        cancelAnimationFrame(requestAnimationFrameId);
    };
    animateScroll();
    // return stop
    return stop;
    function calc(startValue, changeInValue, changedTime, _duration) {
        return startValue + changeInValue * (changedTime / _duration);
    }
}


export function elementsFromPoint(x: number, y: number): Element[] {
    const args: [number, number] = [x, y];
    const func = document.elementsFromPoint
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        || document.msElementsFromPoint
        || _elementsFromPoint;
    return func.apply(document, args);
    function _elementsFromPoint(_x, _y) {
        const parents: any[] = [];
        let parent: any;
        do {
            if (parent !== document.elementFromPoint(_x, _y)) {
                parent = document.elementFromPoint(_x, _y);
                parents.push(parent);
                parent.style.pointerEvents = 'none';
                parent._pointerEvents_backup = parent.style.pointerEvents;
            } else {
                parent = false;
            }
        } while (parent);
        parents.forEach((_parent) => {
            _parent.style.pointerEvents = _parent._pointerEvents_backup;
        });
        return parents;
    }
}

type FindNodeListCallback = (el: HTMLElement, index?: number) => void | boolean;
export function findNodeList(
    list: NodeList,
    callback: FindNodeListCallback,
    opt: { reverse?: boolean } = {},
): HTMLElement|undefined {
    const iterator = iterateAll<HTMLElement>(list, {
        reverse: opt.reverse,
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-restricted-syntax
    for (const { value, index } of iterator) {
        if (callback(value, index)) {
            return value;
        }
    }
    return undefined;
}

class Cache {
    store: object = {};

    has(name: string) {
        // eslint-disable-next-line no-prototype-builtins
        return this.store.hasOwnProperty(name);
    }

    remember(name: string, getter: () => any) {
        if (!this.has(name)) {
            this.store[name] = {
                value: getter(),
            };
        }
        return this.store[name].value;
    }

    forget(name: string) {
        if (name) {
            if (this.has(name)) {
                delete this.store[name];
            }
        } else {
            this.store = {};
        }
    }
}

// attach cached getters to an object; can attach to self
export function attachCache(obj: any, toCache: object, cache = new Cache()) {
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in toCache) {
        const getter = toCache[key];
        Object.defineProperty(obj, key, {
            get() {
                return cache.remember(key, () => getter.call(this));
            },
        });
    }
}


// ### DOM structure
export function insertBefore(el: Node, target: Node) {
    if (target.parentElement) target.parentElement.insertBefore(el, target);
}
export function insertAfter(el: Node, target: Node) {
    if (target.parentElement) target.parentElement.insertBefore(el, target.nextSibling);
}
export function prependTo(el: Node, target: Node) {
    target.insertBefore(el, target.firstChild);
}
export function appendTo(el: Node, target: Node) {
    target.appendChild(el);
}

type BinarySearchReturn<T> = {
    index: number;
    value: T;
    count: number;
    hit: boolean;
    greater?: boolean;
} | null;
interface BinarySearchOptions {
    start?: number;
    end?: number;
    returnNearestIfNoHit?: boolean;
    maxTimes?: number;
}
/**
 * binarySearch
 * @param arr
 * @param callback return `mid - your_value` for ascending array
 * @param _opt
 * @returns
 */
export function binarySearch<T>(
    arr: T[],
    callback: (mid: T, index: number, count: number) => number,
    _opt: BinarySearchOptions = {},
): BinarySearchReturn<T> {
    const opt = {
        start: 0,
        end: arr.length - 1,
        maxTimes: 1000,
        ..._opt,
    };
    let { start, end } = opt;
    const { returnNearestIfNoHit, maxTimes } = opt;
    let midNum;
    let mid;
    if (start == null) {
        start = 0;
        end = arr.length - 1;
    }
    let i = 0;
    let r;
    while (start >= 0 && start <= end) {
        if (i >= maxTimes) {
            throw Error(
                `binarySearch: loop times is over ${maxTimes}, you can increase the limit.`,
            );
        }
        midNum = Math.floor((end - start) / 2 + start);
        mid = arr[midNum];
        const count = i + 1;
        r = callback(mid, midNum, count);
        if (r > 0) {
            end = midNum - 1;
        } else if (r < 0) {
            start = midNum + 1;
        } else {
            return {
                index: midNum as number, value: mid as T, count, hit: true,
            };
        }
        i++;
    }
    return returnNearestIfNoHit
        ? {
            index: midNum as number,
            value: mid as T,
            count: i + 1,
            hit: false,
            greater: r > 0,
        }
        : null;
}
