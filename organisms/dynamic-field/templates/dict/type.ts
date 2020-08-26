import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/components/organisms/dynamic-field/type';
import { DictOptions } from '@/components/organisms/dynamic-field/type/field-schema';


export type DictTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type DictDynamicFieldProps = DynamicFieldProps<
    DictOptions,
    DictTypeOptions
    >
