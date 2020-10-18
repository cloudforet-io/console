import { ModalProps } from '@/components/molecules/modals/type';

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

export interface ContentModalProps extends ModalProps {
    themeColor: ModalThemeColor;
    headerClass: string[];
    bodyClass: string[];
    footerClass: string[];
    headerVisible: boolean;
    bodyVisible: boolean;
    footerVisible: boolean;
}
