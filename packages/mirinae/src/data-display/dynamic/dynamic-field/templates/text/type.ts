import type { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import type { TextOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type TextTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type TextDynamicFieldProps = DynamicFieldProps<
    TextOptions,
    TextTypeOptions
    >;
