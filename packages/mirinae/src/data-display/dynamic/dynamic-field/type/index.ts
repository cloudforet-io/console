/** Props type for Dynamic field component */
import type {
    DynamicFieldOptions,
    DynamicFieldType,
} from '@/data-display/dynamic/dynamic-field/type/field-schema';

export interface DynamicFieldTypeOptions {
    timezone?: string;
    displayKey?: string;
}

export interface DynamicFieldProps<Options = DynamicFieldOptions, TypeOptions = DynamicFieldTypeOptions, ExtraData = any> {
    type: DynamicFieldType;
    options: Options;
    data: any;
    typeOptions?: TypeOptions; // a set of typeOptions props for each component
    extraData?: ExtraData;
    handler?: DynamicFieldHandler;
}

export interface DynamicFieldHandler<
    Options = DynamicFieldOptions,
    TypeOptions = DynamicFieldTypeOptions,
     ExtraData = any> {
    (props: DynamicFieldProps<Options, TypeOptions, ExtraData>): Partial<DynamicFieldProps>;
}

// TODO
/*
export interface DynamicFieldEventListeners {
    copy(): void;
}
 */
