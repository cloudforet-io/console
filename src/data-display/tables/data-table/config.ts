export const DATA_TABLE_STYLE_TYPE = {
    default: 'default',
    light: 'light',
    primary4: 'primary4',
    simple: 'simple',
} as const;
export type DATA_TABLE_STYLE_TYPE = typeof DATA_TABLE_STYLE_TYPE[keyof typeof DATA_TABLE_STYLE_TYPE]

export const DATA_TABLE_CELL_TEXT_ALIGN = {
    right: 'right',
    left: 'left',
    center: 'center',
} as const;
export type DATA_TABLE_CELL_TEXT_ALIGN = typeof DATA_TABLE_CELL_TEXT_ALIGN[keyof typeof DATA_TABLE_CELL_TEXT_ALIGN]
