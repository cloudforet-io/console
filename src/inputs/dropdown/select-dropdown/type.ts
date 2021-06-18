import { MenuItem } from '@/inputs/context-menu/type';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';


export interface SelectDropdownProps {
    items?: MenuItem[];
    selectItem?: string | number;
    invalid?: boolean;
    disabled?: boolean;
    loading?: boolean;
    indexMode: boolean;
    placeholder?: string;
    useFixedMenuStyle?: boolean;
    visibleMenu?: boolean;
    buttonOnly?: boolean;
    buttonStyleType?: BUTTON_STYLE;
    buttonIcon?: string;
}
