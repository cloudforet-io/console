import type { Location } from 'vue-router';

export const LinkSize = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const;
export type LinkSize = typeof LinkSize[keyof typeof LinkSize];

export const ACTION_ICON = {
    NONE: 'none',
    INTERNAL_LINK: 'internal-link',
    EXTERNAL_LINK: 'external-link',
} as const;
export type ActionIcon = typeof ACTION_ICON[keyof typeof ACTION_ICON];

export interface LinkProps {
    text?: string;
    disabled?: boolean;
    highlight?: boolean;
    size?: LinkSize;
    iconLeft?: string;
    actionIcon?: ActionIcon;
    newTab?: boolean;
    href?: string;
    to?: Location;
    useAnchorScroll?: boolean;
    lineHeight?: string;
}
