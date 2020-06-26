export const getBindClass = (cls) => {
    let bindClass = {};
    if (Array.isArray(cls)) {
        cls.forEach((value) => {
            if (typeof value === 'object') {
                // eslint-disable-next-line no-restricted-syntax
                for (const key of value.keys()) {
                    bindClass[key] = value[key];
                }
            } else {
                bindClass[value] = true;
            }
        });
    } else {
        bindClass = cls;
    }
    return bindClass;
};

/**
 * merge bind class(or style) and embedded class(or style)
 * @param originBindData : Array|Object
 * @param newData : Object
 * @return Array
 */
export const mergeBind = (originBindData, newData) => {
    const mergeData = Array.isArray(originBindData) ? originBindData : [originBindData];
    return [
        newData,
        ...mergeData,
    ];
};
