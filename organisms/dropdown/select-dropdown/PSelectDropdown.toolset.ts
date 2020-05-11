export const selectDropdownProps = {
    items: {
        type: Array,
        default: () => [],
    },
    selectItem: {
        type: [String, Number],
    },
    invalid: {
        type: Boolean,
        default: false,
    },
    autoHeight: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
};

// export interface SelectDropdownProps {
//     items
// }
