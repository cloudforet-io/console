export enum BUTTON_STYLE {
    'primary-dark' = 'primary-dark',
    primary = 'primary',
    primary1 = 'primary1',
    primary2 = 'primary2',
    'secondary-dark' = 'secondary-dark',
    secondary = 'secondary',
    secondary1 = 'secondary1',
    gray = 'gray',
    gray900 = 'gray900',
    alert = 'alert',
    safe = 'safe',
    'gray-border' = 'gray-border',
    transparent = 'transparent',
    // 'gray900-hover' = 'gray900-hover',
    // 'gray900-border' = 'gray900-border'
}

export enum BUTTON_SIZE {
    sm = 'sm',
    md = 'md',
    lg = 'lg'
}

export enum BUTTON_FONT_WEIGHT {
    normal = 'normal',
    bold = 'bold'
}

export type ButtonStyle = keyof BUTTON_STYLE;
export type ButtonSize = keyof BUTTON_SIZE;
export type ButtonFontWeight = keyof BUTTON_FONT_WEIGHT;

export interface Button {
    href?: string;
    disabled?: boolean;
    loading?: boolean;
    outline?: boolean;
    styleType?: ButtonStyle;
    size?: ButtonSize;
    block?: boolean;
    fontWeight?: ButtonFontWeight;
}
