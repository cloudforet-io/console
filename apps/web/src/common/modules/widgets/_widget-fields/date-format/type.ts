import type { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';

export type DateFormat = keyof typeof DATE_FORMAT;

export interface DateFormatValue {
    value: DateFormat;
}

export interface DateFormatOptions {
    default: DateFormat;
}
