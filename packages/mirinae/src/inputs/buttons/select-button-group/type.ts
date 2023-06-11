import type { ButtonProps } from '@/inputs/buttons/button/type';

export type ButtonType = 'default' | 'text';

export interface SelectButtonType extends ButtonProps {
    label: string;
    name: string;
}

export interface SelectButtonGroupProps {
    buttons: Array<string|SelectButtonType>;
    selected: string | number;
    buttonType: ButtonType;
}
