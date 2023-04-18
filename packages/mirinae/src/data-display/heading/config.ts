export const HEADING_TYPE = {
    MAIN: 'main',
    SUB: 'sub',
} as const;

export type HeadingType = typeof HEADING_TYPE[keyof typeof HEADING_TYPE];
