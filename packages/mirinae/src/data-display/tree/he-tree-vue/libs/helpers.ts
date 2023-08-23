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
 * return new array excluding n items from end
 * @param arr
 * @param n
 * @returns
 */
export function arrayWithoutEnd<T>(arr: T[], n = 1): T[] {
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
 * get last of array
 * @param arr
 * @returns
 */
export function arrayLast<T>(arr: T[]) {
    return arr[arr.length - 1];
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






