import { indigo } from '@/styles/colors.cjs';

export const AVATAR_SIZE = {
    SM: 'sm',
    MD: 'md',
    XL: 'xl',
} as const;

export const AVATAR_COLOR = {
    indigo200: indigo[200],
    indigo300: indigo[300],
} as const;

export const ICON_SIZE: Record<SizeType, string> = {
    sm: '1.5rem',
    md: '1.75rem',
    xl: '4rem',
} as const;

export type SizeType = typeof AVATAR_SIZE[keyof typeof AVATAR_SIZE];
export type ColorType = typeof AVATAR_COLOR[keyof typeof AVATAR_COLOR];
