import type { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import type { ListOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type ListTypeOptions = DynamicFieldTypeOptions;

export type ListDynamicFieldProps = DynamicFieldProps<
    ListOptions,
    ListTypeOptions
    >;
