import { Button } from '@/inputs/buttons/button/type';

type ButtonType = 'default' | 'text';

export interface SelectButtonType extends Button {
    label: string;
    name: string;
}

export interface SelectButtonGroupProps {
    buttons: Array<string|SelectButtonType>;
    selected: string | number;
    buttonType: ButtonType;
}
