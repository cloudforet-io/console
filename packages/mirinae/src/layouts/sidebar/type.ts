export const STYLE_TYPE = Object.freeze({
    primary: 'primary',
    secondary: 'secondary',
} as const);

type STYLE_TYPE = typeof STYLE_TYPE[keyof typeof STYLE_TYPE];


export const SIZE = Object.freeze({
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const);
export type SIZE = typeof SIZE[keyof typeof SIZE];

export interface SidebarProps {
    visible: boolean;
    title: string;
    styleType: STYLE_TYPE;
    size: SIZE;
    hideCloseButton: boolean;
}
