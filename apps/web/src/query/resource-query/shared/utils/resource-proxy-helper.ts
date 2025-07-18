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
    _target: TTarget,
    baseGet: (target: TTarget, prop: string) => TResult|undefined,
): Record<keyof TTarget, TResult> => new Proxy(_target, {
        get(target: TTarget, p: string): TResult | undefined {
            if (IGNORED_KEYS.has(p) || typeof p !== 'string' || p === 'undefined' || p === 'null') return undefined;
            return baseGet(target, p);
        },
    });



export const makeReferenceDataModelProxy = < TModel extends Record<string, () => { map: Record<string, any> }>>(
    _target: TModel,
    baseGet: <TProp extends keyof TModel>(target: TModel, prop: TProp) => ReturnType<TModel[TProp]>['map'],
): {
    [K in keyof TModel]: ReturnType<TModel[K]>['map'];
} => new Proxy(_target, {
        get(target: TModel, prop: string|symbol|undefined) {
            if (!prop) return undefined;
            if (IGNORED_KEYS.has(prop) || typeof prop !== 'string' || prop === 'undefined' || prop === 'null') return undefined;
            return baseGet(target, prop);
        },
    });
