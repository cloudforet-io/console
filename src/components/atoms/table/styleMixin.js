const color = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'gray900'];
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

export const getClass = (props) => {
    const data = {};
    if (props.styleType) {
        data.class[`table-${props.styleType}`] = true;
    } if (props.background) {
        data.class[`bg-${props.background}`] = true;
    }
    return data;
};
