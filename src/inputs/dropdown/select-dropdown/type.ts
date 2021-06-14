import { MenuItem } from '@/inputs/context-menu/type';

enum BUTTON_STYLE_TYPE {
    'primary-dark' = 'primary-dark'
}

export interface SelectDropdownStateType {
    items: MenuItem[];
    invalid: boolean;
    autoHeight: boolean;
    disabled: boolean;
    loading: boolean;
    indexMode: boolean;
    placeholder: string;
    useCustomStyle: boolean;
    showPopup: boolean;
    buttonOnly: boolean;
    buttonStyleType?: keyof BUTTON_STYLE_TYPE;
    buttonIcon: string;
}

export interface SelectDropdownSyncStateType {
    selectItem: string | number;
}

export interface SelectDropdownProps extends SelectDropdownStateType, SelectDropdownSyncStateType {}
