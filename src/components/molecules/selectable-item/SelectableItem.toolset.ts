export const selectableItemProps = {
    iconUrl: {
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
    defaultIcon: {
        type: String,
        default: '',
    },
};

export interface SelectableItemPropsType {
    iconUrl?: string;
    title?: string;
    active?: boolean;
    disabled?: boolean;
    defaultIcon?: string;
}
