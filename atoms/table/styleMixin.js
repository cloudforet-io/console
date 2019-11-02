const color = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
export const mixin = {
    props: {
        styleType: {
            type: String,
            default: null,
            validator(value) {
                return [null, ...color].indexOf(value) !== -1;
            },
        },
        background: {
            type: String,
            default: null,
            validator(value) {
                return [null, ...color].indexOf(value) !== -1;
            },
        },
    },
};
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

export const getClass = (props) => {
    const data = {};
    if (props.styleType) {
        data.class[`table-${props.styleType}`] = true;
    } if (props.background) {
        data.class[`bg-${props.background}`] = true;
    }
    return data;
};
