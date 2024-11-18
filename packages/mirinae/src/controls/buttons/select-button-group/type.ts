import type { ButtonProps } from '@/controls/buttons/button/type';

type ButtonType = 'default' | 'text';

export interface SelectButtonType extends ButtonProps {
    label: string;
    name: string;
}

export interface SelectButtonGroupProps {
    buttons: Array<string|SelectButtonType>;
    selected: string | number;
    buttonType: ButtonType;
}
