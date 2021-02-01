import { MenuItem } from '@/inputs/context-menu/type';

export interface SelectDropdownStateType {
    items: MenuItem[];
    invalid: boolean;
    autoHeight: boolean;
    disabled: boolean;
    loading: boolean;
    indexMode: boolean;
    placeholder: string;
}

export interface SelectDropdownSyncStateType {
    selectItem: string | number;
}

export interface SelectDropdownProps extends SelectDropdownStateType, SelectDropdownSyncStateType {}
