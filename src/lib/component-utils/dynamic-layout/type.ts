import {
    SearchKeyOptions,
    SearchSchema,
    SearchDataType,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { DynamicField } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type/field-schema';
import { Reference } from '@/lib/reference/type';


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
