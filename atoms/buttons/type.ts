export enum BUTTON_STYLE {
    primary = 'primary',
    'primary-dark' = 'primary-dark',
    primary1 = 'primary1',
    primary2 = 'primary2',
    primary3 = 'primary3',
    primary4 = 'primary4',
    secondary = 'secondary',
    secondary1 = 'secondary1',
    secondary2 = 'secondary2',
    coral = 'coral',
    yellow = 'yellow',
    gray = 'gray',
    gray200 = 'gray200',
    gray100 = 'gray100',
    gray900 = 'gray900',
    'gray900-hover' = 'gray900-hover',
    black = 'black',
    alert = 'alert',
    safe = 'safe',
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
    outline?: boolean;
    styleType?: ButtonStyle;
    size?: ButtonSize;
    block?: boolean;
}
