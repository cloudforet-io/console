export const selectableItemProps = {
    icon: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: '',
    },
    active: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
};

export interface SelectableItemPropsType {
    icon?: string;
    title?: string;
    active?: boolean;
    disabled?: boolean;
}
