export const COLLECT_DATA_TYPE = {
    ENTIRE: 'entire',
    SINGLE: 'secret',
} as const;
export type CollectDataType = typeof COLLECT_DATA_TYPE[keyof typeof COLLECT_DATA_TYPE];
