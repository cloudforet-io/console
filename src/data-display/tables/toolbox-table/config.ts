export const TOOLBOX_TABLE_STYLE_TYPE = {
    lightGray: 'light-gray',
} as const;

export type TOOLBOX_TABLE_STYLE_TYPE = typeof TOOLBOX_TABLE_STYLE_TYPE[keyof typeof TOOLBOX_TABLE_STYLE_TYPE]
