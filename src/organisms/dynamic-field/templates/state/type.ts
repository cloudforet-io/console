import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/organisms/dynamic-field/type';
import { StateOptions } from '@/organisms/dynamic-field/type/field-schema';


export type StateTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type StateDynamicFieldProps = DynamicFieldProps<
    StateOptions,
    StateTypeOptions
    >
