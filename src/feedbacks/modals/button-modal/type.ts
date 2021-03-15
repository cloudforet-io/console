import { Button } from '@/inputs/buttons/button/type';

export enum sizeMapping {
    sm = 'modal-sm',
    md = '',
    lg = 'modal-lg',
    xl = 'modal-xl',
}
export type ModalSizeType = keyof typeof sizeMapping;


export const THEME_COLORS = [
    'primary',
    'primary-dark',
    'primary1',
    'primary2',
    'secondary',
    'secondary1',
    'safe',
    'alert',
    'gray900',
    'gray',
];

export type ModalThemeColor = typeof THEME_COLORS[number];

export interface ButtonModalProps {
    fade: boolean;
    scrollable: boolean;
    size: ModalSizeType;
    visible: boolean; // sync
    centered: boolean;
    backdrop: boolean;

    themeColor: ModalThemeColor;
    headerClass: string[];
    bodyClass: string[];
    footerClass: string[];
    headerVisible: boolean;
    bodyVisible: boolean;
    footerVisible: boolean;

    headerTitle: string;
    headerCloseButtonVisible: boolean;
    footerCancelButtonVisible: boolean;
    footerConfirmButtonVisible: boolean;

    hideOnCancel: boolean;
    loading: boolean;
    disabled: boolean;
}
