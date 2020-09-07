import { MenuItem } from '@/components/organisms/context-menu/type';

enum BUTTON_STYLE_TYPE {
    'primary-dark' = 'primary-dark'
}

export const dropdownMenuBtnProps = {
    menu: {
        type: [Array, Object],
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    autoHeight: {
        type: Boolean,
        default: false,
    },
    block: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    buttonOnly: {
        type: Boolean,
        default: false,
    },
    buttonIcon: {
        type: String,
        default: undefined,
    },
    buttonStyleType: {
        type: String,
        default: undefined,
        validator: (value) => {
            if (value === undefined) return true;
            return Object.keys(BUTTON_STYLE_TYPE).includes(value);
        },
    },
};

export interface DropdownMenuBtnProps {
    menu: MenuItem[];
    loading: boolean;
    autoHeight: boolean;
    block: boolean;
    disabled: boolean;
    buttonOnly: boolean;
    buttonIcon?: string;
    buttonStyleType?: keyof BUTTON_STYLE_TYPE;
}
