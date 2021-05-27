import { MenuItem } from '@/inputs/context-menu/type';

enum BUTTON_STYLE_TYPE {
    'primary-dark' = 'primary-dark'
}

export interface DropdownMenuButtonProps {
    menu: MenuItem[];
    loading: boolean;
    autoHeight: boolean;
    disabled: boolean;
    buttonOnly: boolean;
    buttonIcon?: string;
    buttonStyleType?: keyof BUTTON_STYLE_TYPE;
    useCustomStyle: boolean;
    showPopup: boolean;
}
