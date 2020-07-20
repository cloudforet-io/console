import { MenuItem } from '@/components/organisms/context-menu/context-menu/PContextMenu.toolset';
import { ICON_BUTTON_STYLE_TYPE } from '@/components/molecules/buttons/icon-button/PIconButton.toolset';
import { dropdownBtnProps } from '@/components/organisms/dropdown/dropdown-btn/PDropdownBtn.toolset';

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
    buttonOnly: dropdownBtnProps.buttonOnly,
    buttonIcon: dropdownBtnProps.buttonIcon,
    buttonStyleType: dropdownBtnProps.buttonStyleType,
};

export interface DropdownMenuBtnProps {
    menu: MenuItem[];
    loading: boolean;
    autoHeight: boolean;
    block: boolean;
    disabled: boolean;
    buttonOnly: boolean;
    buttonIcon?: string;
    buttonStyleType?: keyof ICON_BUTTON_STYLE_TYPE;
}
