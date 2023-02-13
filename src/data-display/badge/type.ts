export const BADGE_TYPE = {
    SOLID: 'solid',
    SOLID_OUTLINE: 'solid-outline',
    SUBTLE: 'subtle',
} as const;
export type BadgeType = typeof BADGE_TYPE[keyof typeof BADGE_TYPE];

export const BADGE_SHAPE = {
    ROUND: 'round',
    SQUARE: 'square',
} as const;

export const SOLID_STYLE_TYPE = {
    primary: 'primary',
    alert: 'alert',
    safe: 'safe',
} as const;
export const SOLID_OUTLINE_STYLE_TYPE = {
    primary: 'primary',
    primary1: 'primary1',
    secondary1: 'secondary1',
    alert: 'alert',
    safe: 'safe',
    gray900: 'gray900',
    gray500: 'gray500',
    coral500: 'coral500',
    peacock400: 'peacock400',
    indigo500: 'indigo500',
} as const;
export const SUBTLE_STYLE_TYPE = {
    primary3: 'primary3',
    blue200: 'blue200',
    blue300: 'blue300',
    green200: 'green200',
    indigo100: 'indigo100',
    gray100: 'gray100',
    gray200: 'gray200',
    yellow200: 'yellow200',
    red100: 'red100',
} as const;
export const BADGE_STYLE_TYPE = {
    ...SOLID_STYLE_TYPE,
    ...SOLID_OUTLINE_STYLE_TYPE,
    ...SUBTLE_STYLE_TYPE,
} as const;

export type BadgeStyleType = typeof BADGE_STYLE_TYPE[keyof typeof BADGE_STYLE_TYPE];
export type BadgeShape = typeof BADGE_SHAPE[keyof typeof BADGE_SHAPE];

export interface BadgeProps {
    badgeType: BadgeType;
    styleType: BadgeStyleType;
    textColor?: string;
    backgroundColor?: string;
    shape: BadgeShape;
}
