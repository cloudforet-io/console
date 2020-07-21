export enum BADGE_SHAPE {
    ROUND='round',
    SQUARE='square',
}

export enum BADGE_STYLE {
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
    alert = 'alert',
    safe = 'safe',
    gray900 = 'gray900',
}

export interface BadgeProps {
    styleType: keyof BADGE_STYLE;
    textColor?: string;
    backgroundColor?: string;
    shape: keyof typeof BADGE_SHAPE;
    outline: boolean;
    link?: string;
}
