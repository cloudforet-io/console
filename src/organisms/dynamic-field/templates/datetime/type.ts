import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/organisms/dynamic-field/type';
import { DatetimeOptions } from '@/organisms/dynamic-field/type/field-schema';


export type DatetimeTypeOptions = Pick<DynamicFieldTypeOptions, 'timezone'>;

export type DatetimeDynamicFieldProps = DynamicFieldProps<
    DatetimeOptions,
    DatetimeTypeOptions
    >
