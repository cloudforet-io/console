const IGNORED_KEYS = new Set([
    '__ob__',
    '__v_isRef',
    '__v_isReactive',
    '__v_raw',
    '_isVue',
    '__v_readonly',
    '__v_isReadonly',
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

export const makeResourceProxy = <TTarget extends Record<string, any>, TResult = any>(
    target: TTarget,
    baseGet: (target: TTarget, prop: string) => TResult,
): Record<keyof TTarget, TResult> => new Proxy(target, {
        get(_, id: string) {
            if (IGNORED_KEYS.has(id) || typeof id !== 'string' || id === 'undefined' || id === 'null') return undefined;
            return baseGet(_, id);
        },
    });
