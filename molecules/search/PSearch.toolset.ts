export const searchProps = {
    value: {
        type: String,
        default: '',
        required: true,
    },
    placeholder: {
        type: String,
        default: 'Search',
    },
    focused: {
        type: Boolean,
        default: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    disableIcon: {
        type: Boolean,
        default: false,
    },
    /** sync */
    isFocused: {
        type: Boolean,
        default: undefined,
    },
};
