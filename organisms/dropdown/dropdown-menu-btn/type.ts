import { MenuItem } from '@/components/organisms/context-menu/type';

enum BUTTON_STYLE_TYPE {
    'primary-dark' = 'primary-dark'
}

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
