import type { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import type { DatetimeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type DatetimeTypeOptions = Pick<DynamicFieldTypeOptions, 'timezone'>;

export type DatetimeDynamicFieldProps = DynamicFieldProps<
    DatetimeOptions,
    DatetimeTypeOptions
    >;
