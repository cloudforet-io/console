export enum ICON_BUTTON_STYLE_TYPE {
    primary = 'primary',
    'primary-dark' = 'primary-dark',
    primary1 = 'primary1',
    primary2 = 'primary2',
    secondary = 'secondary',
    secondary1 = 'secondary1',
    gray = 'gray',
    gray900 = 'gray900',
    alert = 'alert',
    safe = 'safe',
    transparent = 'transparent',
    'gray-border' = 'gray-border',
}

export enum ICON_BUTTON_SHAPE {
    circle = 'circle',
    square = 'square',
}

export enum ICON_BUTTON_SIZE {
    sm = '1rem',
    md = '1.5rem',
    lg = '2rem',
}

export type IconButtonStyle = keyof typeof ICON_BUTTON_STYLE_TYPE;
export type IconButtonShape = keyof typeof ICON_BUTTON_SHAPE;
export type IconButtonSize = keyof typeof ICON_BUTTON_SIZE;

export interface IconButtonProps {
    name: string;
    loading: boolean;
    styleType: IconButtonStyle;
    color: string;
    disabled: boolean;
    activated: boolean;
    outline: boolean;
    size: IconButtonSize;
    shape: IconButtonShape;
}
