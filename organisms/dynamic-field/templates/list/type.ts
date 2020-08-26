import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/components/organisms/dynamic-field/type';
import { ListOptions } from '@/components/organisms/dynamic-field/type/field-schema';


export type ListTypeOptions = Pick<DynamicFieldTypeOptions, 'typeOptionsMap'>;

export type ListDynamicFieldProps = DynamicFieldProps<
    ListOptions,
    ListTypeOptions
    >
