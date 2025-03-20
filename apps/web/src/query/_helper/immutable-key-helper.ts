export const createImmutableObject = <T extends Record<string, any>>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => createImmutableObject(item)) as unknown as T;
    }

    const immutableObj = Object.entries(obj).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: createImmutableObject(value),
    }), {});

    return Object.freeze(immutableObj) as T;
};
