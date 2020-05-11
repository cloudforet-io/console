import { MenuItem } from '@/components/organisms/context-menu/context-menu/PContextMenu.toolset';

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
};

export interface DropdownMenuBtnProps {
    menu: MenuItem[];
    loading: boolean;
    autoHeight: boolean;
    block: boolean;
    disabled: boolean;
}
