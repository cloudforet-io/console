export const dropdownBtnProps = {
    disabled: {
        type: Boolean,
        default: false,
    },
    popup: {
        type: Boolean,
        default: false,
    },
    block: {
        type: Boolean,
        default: false,
    },
};


export interface DropdownBtnProps {
    popup: boolean;
    disabled: boolean;
    block: boolean;
}
