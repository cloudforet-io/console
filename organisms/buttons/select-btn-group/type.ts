import { Button } from '@/components/atoms/buttons/type';

export interface SelectBtnType extends Button {
    label: string;
    name: string;
}

export interface SelectBtnGroupProps {
    buttons: Array<string|SelectBtnType>;
    selected: string | number;
    styleType: string;
}
