import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/organisms/dynamic-field/type';
import { ListOptions } from '@/organisms/dynamic-field/type/field-schema';


export type ListTypeOptions = Pick<DynamicFieldTypeOptions, 'typeOptionsMap'>;

export type ListDynamicFieldProps = DynamicFieldProps<
    ListOptions,
    ListTypeOptions
    >
