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
] as const;

export type ModalThemeColor = typeof THEME_COLORS[number];

export interface ButtonModalProps {
    visible: boolean; // sync
    scrollable: boolean;
    size: ModalSizeType;
    backdrop: boolean;
    themeColor: ModalThemeColor;
    headerTitle: string;

    hideHeader: boolean;
    hideBody: boolean;
    hideFooter: boolean;

    hideHeaderCloseButton: boolean;
    hideFooterCloseButton: boolean;
    footerResetButtonVisible: boolean;

    loading: boolean;
    disabled: boolean;
}
