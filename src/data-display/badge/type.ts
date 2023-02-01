export const BADGE_SHAPE = Object.freeze({
    ROUND: 'round',
    SQUARE: 'square',
});

export const BADGE_STYLE = Object.freeze({
    primary: 'primary',
    'primary-dark': 'primary-dark',
    primary1: 'primary1',
    primary2: 'primary2',
    secondary: 'secondary',
    secondary1: 'secondary1',
    coral600: 'coral600',
    coral500: 'coral500',
    gray900: 'gray900',
    gray: 'gray',
    alert: 'alert',
    safe: 'safe',
    peacock: 'peacock',
    indigo: 'indigo',
    indigo100: 'indigo100',

    primary3: 'primary3',
    blue200: 'blue200',
    blue300: 'blue300',
    green200: 'green200',
    gray200: 'gray200',
    coral100: 'coral100',
    peacock200: 'peacock200',
    yellow200: 'yellow200',
    red100: 'red100',
});

export const BADGE_STYLE_OUTLINE = Object.freeze({
    primary: 'primary',
    'primary-dark': 'primary-dark',
    primary1: 'primary1',
    primary2: 'primary2',
    secondary: 'secondary',
    secondary1: 'secondary1',
    coral600: 'coral600',
    coral500: 'coral500',
    gray900: 'gray900',
    gray: 'gray',
    alert: 'alert',
    safe: 'safe',
    peacock: 'peacock',
    indigo: 'indigo',
});

export type BadgeStyleType = typeof BADGE_STYLE[keyof typeof BADGE_STYLE];
export type BadgeShape = typeof BADGE_SHAPE[keyof typeof BADGE_SHAPE];

export interface BadgeProps {
    styleType: BadgeStyleType;
    textColor?: string;
    backgroundColor?: string;
    shape: BadgeShape;
    outline: boolean;
}
