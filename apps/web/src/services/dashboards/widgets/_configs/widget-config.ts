import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

interface BaseItemOptions {
    label?: string;
}
export interface EnumOptions extends BaseItemOptions {
    type: 'ENUM';
    values: { key: string; label: string; }[];
}
export interface SearchResourceOptions extends BaseItemOptions {
    type: 'SEARCH_RESOURCE';
    resource_type: string;
    resource_key?: string;
    default_path?: string|number;
    filters?: ConsoleFilter[];
}
export interface ReferenceResourceOptions extends BaseItemOptions {
    type: 'REFERENCE_RESOURCE',
    reference_key: string;
}

export interface WidgetOptionsSchemaProperty {
    key: string; // e.g. cost_data_source
    name: string; // e.g. Data Source
    selection_type?: 'SINGLE'|'MULTI';
    readonly?: boolean;
    fixed?: boolean;
    non_inheritable?: boolean;
    item_options?: Array<EnumOptions|SearchResourceOptions|ReferenceResourceOptions>;
    dependencies?: {
        [property: string]: { // e.g. 'cost_data_source'
            key: string; // e.g. 'data_source_id'
        }
    };
}
export type WidgetOptionsSchema = WidgetOptionsSchemaProperty[];

/* example
[
    {
        key: 'product',
        name: 'Product',
        selection_type: 'MULTI',
        fixed: true,
        item_options: [
            { type: 'SEARCH_RESOURCE', resource_type: 'cost_analysis.Cost', resource_key: 'product' }
        ],
        dependencies: {
            'cost_data_source': { key: 'data_source_id' }
        }
    },
    {
        key: 'data_type',
        name: 'Data Type',
        selection_type: 'SINGLE',
        fixed: true,
        item_options: [
            { type: 'SEARCH_RESOURCE', resource_type: 'cost_analysis.Cost', resource_key: 'product' }
        ],
        dependencies: {
            'cost_data_source': { key: 'data_source_id' }
        }
    }
]
 */
