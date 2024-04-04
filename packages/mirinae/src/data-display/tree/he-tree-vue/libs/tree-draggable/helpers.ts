import { getViewportPosition, iterateAll } from '@/data-display/tree/he-tree-vue/libs/helpers';

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

