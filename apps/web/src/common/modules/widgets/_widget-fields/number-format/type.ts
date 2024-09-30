import type { NUMBER_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';

export type NumberFormat = typeof NUMBER_FORMAT[keyof typeof NUMBER_FORMAT];
export interface NumberFormatValue {
    [key: string]: {
        format: NumberFormat;
        customNumberFormat?: string;
    };
}

export interface NumberFormatOptions {
    default?: NumberFormat;
}
