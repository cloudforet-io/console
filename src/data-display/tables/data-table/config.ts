export const DATA_TABLE_STYLE_TYPE = {
    default: 'default',
    light: 'light',
    primary4: 'primary4',
} as const;
export type DATA_TABLE_STYLE_TYPE = typeof DATA_TABLE_STYLE_TYPE[keyof typeof DATA_TABLE_STYLE_TYPE]
