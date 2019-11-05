export const getBindClass = (cls) => {
    let bindClass = {};
    if (Array.isArray(cls)) {
        cls.forEach((value) => {
            if (typeof value === 'object') {
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
