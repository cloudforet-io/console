import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import { DictOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type DictTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type DictDynamicFieldProps = DynamicFieldProps<
    DictOptions,
    DictTypeOptions
    >
