export enum ICON_BUTTON_STYLE_TYPE {
    'primary-dark' = 'primary-dark'
}

export const iconButtonProps = {
    name: {
        type: String,
        default: '',
    },
    dir: {
        type: String,
        default: null,
    },
    fill: {
        type: Boolean,
        default: true,
    },
    width: {
        type: String,
        default: '1.5rem',
    },
    height: {
        type: String,
        default: '1.5rem',
    },
    scale: {
        type: String,
        default: undefined,
    },
    original: {
        type: Boolean,
        default: true,
    },
    title: {
        type: String,
        default: undefined,
    },
    color: {
        type: String,
        default: 'transparent inherit',
    },
    styleType: {
        type: String,
        default: undefined,
        validator: (value) => {
            if (value === undefined) return true;
            return Object.keys(ICON_BUTTON_STYLE_TYPE).includes(value);
        },
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    outline: {
        type: Boolean,
        default: false,
    },
    solid: {
        type: Boolean,
        default: false,
    },
};
