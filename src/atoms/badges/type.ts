export enum BADGE_SHAPE {
    ROUND='round',
    SQUARE='square',
}

export enum BADGE_STYLE {
    primary = 'primary',
    'primary-dark' = 'primary-dark',
    primary1 = 'primary1',
    primary2 = 'primary2',
    secondary = 'secondary',
    secondary1 = 'secondary1',
    coral600 = 'coral600',
    coral500 = 'coral500',
    gray900 = 'gray900',
    gray = 'gray',
    gray200 = 'gray200',
    alert = 'alert',
    safe = 'safe',
    peacock = 'peacock',
    indigo = 'indigo',
}

export type BadgeStyleType = keyof BADGE_STYLE
export type BadgeShape = keyof typeof BADGE_SHAPE

export interface Badge {
    styleType: BadgeStyleType;
    textColor?: string;
    backgroundColor?: string;
    shape: BadgeShape;
    outline: boolean;
}
