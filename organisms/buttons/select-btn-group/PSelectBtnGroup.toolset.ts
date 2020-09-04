import { Button } from '@/components/atoms/buttons/type';

export interface SelectBtnType extends Button {
    label: string;
    name: string;
}
export interface Props {
    buttons: Array<string|SelectBtnType>;
    selected: string;
    space?: boolean;
}
