import { ButtonProps } from '@/components/atoms/buttons/PButton.toolset';

export interface SelectBtnType extends ButtonProps {
    label: string;
    name: string;
}
export interface Props {
    buttons: Array<string|SelectBtnType>;
    selected: string;
    space?: boolean;
}
