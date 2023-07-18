export const SIDEBAR_STYLE = {
    LINK: 'LINK',
    DEFAULT: 'DEFAULT',
} as const;

export type SideBarStyle = typeof SIDEBAR_STYLE[keyof typeof SIDEBAR_STYLE];
