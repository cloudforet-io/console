enum SizeMapping {
    sm = 'modal-sm',
    md = '',
    lg = 'modal-lg',
    xl = 'modal-xl',
}
export type ModalSizeType = keyof typeof SizeMapping;


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
] as const;

export type ModalThemeColor = typeof THEME_COLORS[number];

export interface ButtonModalProps {
    visible: boolean; // sync
    size: ModalSizeType;
    backdrop: boolean;
    themeColor: ModalThemeColor;
    headerTitle: string;

    hideHeader: boolean;
    hideBody: boolean;
    hideFooter: boolean;

    hideHeaderCloseButton: boolean;
    hideFooterCloseButton: boolean;
    hideFooterConfirmButton: boolean;
    footerResetButtonVisible: boolean;

    loading: boolean;
    disabled: boolean;
}
