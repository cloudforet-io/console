import { DynamicField } from '@src/component-util/dynamic-layout/field-schema';
import { SearchDataType, SearchKeyOptions, SearchSchema } from '@src/component-util/dynamic-layout/layout-schema';

export interface Reference {
    resource_type: string;
    reference_key?: string;
}

export interface SearchKeyItem extends SearchKeyOptions {
    reference?: string;
    api_data_type?: SearchDataType;
}

export interface ConsoleSearchSchema extends SearchSchema {
    items: SearchKeyItem[];
}

export interface ConsoleDynamicField extends DynamicField {
    reference?: Reference;
}
