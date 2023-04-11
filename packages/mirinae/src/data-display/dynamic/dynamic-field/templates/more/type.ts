import type {
    DynamicFieldProps,
    DynamicFieldTypeOptions,
} from '@/data-display/dynamic/dynamic-field/type';
import type { MoreOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type MoreTypeOptions = Pick<DynamicFieldTypeOptions, 'displayKey'>;

export type MoreDynamicFieldProps = DynamicFieldProps<
    MoreOptions,
    MoreTypeOptions
    >;
