import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/components/organisms/dynamic-field/type';
import { StateOptions } from '@/components/organisms/dynamic-field/type/field-schema';


export type StateTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type StateDynamicFieldProps = DynamicFieldProps<
    StateOptions,
    StateTypeOptions
    >
