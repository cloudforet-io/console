import { ButtonSize } from '@/components/atoms/buttons/type';

export enum BUTTON_STYLE_TYPE {
    'primary-dark' = 'primary-dark'
}

export interface IconButtonProps {
    name: string;
    dir: string | null;
    fill: boolean;
    width: string;
    height: string;
    scale?: string;
    original: boolean;
    title?: string;
    color: string;
    styleType?: string;
    disabled: boolean;
    outline: boolean;
    solid: boolean;
    size?: ButtonSize;
}
