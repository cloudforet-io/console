export const AVATAR_SIZE = {
    SM: 'sm',
    MD: 'md',
    XL: 'xl',
} as const;

export const AVATAR_COLOR = {
    INDIGO_200: 'indigo200',
    INDIGO_300: 'indigo300',
} as const;

export const ICON_SIZE: Record<SizeType, string> = {
    sm: '1.5rem',
    md: '1.75rem',
    xl: '4rem',
} as const;

export type SizeType = typeof AVATAR_SIZE[keyof typeof AVATAR_SIZE];
export type ColorType = typeof AVATAR_COLOR[keyof typeof AVATAR_COLOR];
