import type { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import type { StateOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type StateTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type StateDynamicFieldProps = DynamicFieldProps<
    StateOptions,
    StateTypeOptions
    >;
