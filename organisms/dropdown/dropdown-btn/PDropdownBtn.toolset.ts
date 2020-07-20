import { ICON_BUTTON_STYLE_TYPE, iconButtonProps } from '@/components/molecules/buttons/icon-button/PIconButton.toolset';

export const dropdownBtnProps = {
    /* sync */
    popup: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    block: {
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
    buttonStyleType: iconButtonProps.styleType,
};


export interface DropdownBtnProps {
    popup: boolean;
    disabled: boolean;
    block: boolean;
    buttonOnly: boolean;
    buttonIcon?: string;
    buttonStyleType?: keyof ICON_BUTTON_STYLE_TYPE;
}
