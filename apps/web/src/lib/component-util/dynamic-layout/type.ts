import type { DynamicField } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type/field-schema';
import type {
    SearchKeyOptions,
    SearchSchema,
    SearchDataType,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

export interface Reference {
    // eslint-disable-next-line camelcase
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
