import {
    SearchKeyOptions,
    SearchSchema,
    SearchDataType,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { DynamicField } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type/field-schema';


export interface Reference {
    resource_type: string;
    // eslint-disable-next-line camelcase
    reference_key?: string;
}

export interface SearchKeyItem extends SearchKeyOptions {
    reference?: string;
    // eslint-disable-next-line camelcase
    api_data_type?: SearchDataType;
}

export interface ConsoleSearchSchema extends SearchSchema {
    items: SearchKeyItem[];
}

export interface ConsoleDynamicField extends DynamicField {
    reference?: Reference;
}
