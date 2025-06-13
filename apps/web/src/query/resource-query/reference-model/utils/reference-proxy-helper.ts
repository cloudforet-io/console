const IGNORED_KEYS = new Set([
    '__ob__',
    '__v_isRef',
    '__v_isReactive',
    '__v_raw',
    '_isVue',
    '__v_readonly',
    'state',
    'effect',
    'currentRoute',
    'toJSON',
    'toString',
    'render',
    'constructor',
    Symbol.toPrimitive,
    Symbol.iterator,
]);

export const makeReferenceProxy = <T extends object>(
    target: T,
    baseGet: (target: T, prop: string) => any,
) => new Proxy(target, {
        get(_, id: string) {
            if (IGNORED_KEYS.has(id) || typeof id !== 'string') return undefined;
            return baseGet(_, id);
        },
    });
