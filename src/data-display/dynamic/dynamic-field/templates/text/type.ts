import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import { TextOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type TextTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type TextDynamicFieldProps = DynamicFieldProps<
    TextOptions,
    TextTypeOptions
    >
