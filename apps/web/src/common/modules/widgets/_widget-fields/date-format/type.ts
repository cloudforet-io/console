import type { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';

export type DateFormat = keyof typeof DATE_FORMAT;

export interface DateFormatOptions {
    default?: DateFormat;
}

export interface DateFormatValue {
    format: DateFormat;
}
