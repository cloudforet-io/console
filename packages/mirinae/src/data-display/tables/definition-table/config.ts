export
const DEFINITION_TABLE_STYLE_TYPE = Object.freeze({
    primary: 'primary',
    white: 'white',
} as const);

export type DEFINITION_TABLE_STYLE_TYPE = typeof DEFINITION_TABLE_STYLE_TYPE[keyof typeof DEFINITION_TABLE_STYLE_TYPE];
