import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import { ListOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type ListTypeOptions = Pick<DynamicFieldTypeOptions, 'typeOptionsMap'>;

export type ListDynamicFieldProps = DynamicFieldProps<
    ListOptions,
    ListTypeOptions
    >
