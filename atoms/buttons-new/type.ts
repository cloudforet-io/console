export enum BUTTON_STYLE {
    primary = 'primary',
    'primary-dark' = 'primary-dark',
    primary1 = 'primary1',
    primary2 = 'primary2',
    secondary = 'secondary',
    secondary1 = 'secondary1',
    gray = 'gray',
    gray900 = 'gray900',
    'gray900-hover' = 'gray900-hover',
    'gray900-border' = 'gray900-border',
    alert = 'alert',
    safe = 'safe',
    transparent = 'transparent'
}

export enum BUTTON_SIZE {
    sm = 'sm',
    lg = 'lg'
}

export type ButtonStyle = keyof BUTTON_STYLE;
export type ButtonSize = keyof BUTTON_SIZE;

export interface Button {
    link?: string;
    disabled?: boolean;
    loading?: boolean;
    outline?: boolean;
    styleType?: ButtonStyle;
    size?: ButtonSize;
    block?: boolean;
}
