import type { EnumModelOptions, SearchResourceModelOptions, ReferenceResourceModelOptions } from '@/models/widget';

export interface WidgetOptionsSchemaProperty {
    key: string; // e.g. cost_data_source
    name: string; // e.g. Data Source
    selection_type?: 'SINGLE'|'MULTI';
    readonly?: boolean;
    fixed?: boolean;
    non_inheritable?: boolean;
    item_options?: Array<EnumModelOptions|ReferenceResourceModelOptions|SearchResourceModelOptions>;
    dependencies?: {
        [property: string]: { // e.g. 'cost_data_source'
            key: string; // e.g. 'data_source_id'
        }
    };
}
export type WidgetOptionsSchemaConfig = WidgetOptionsSchemaProperty[];

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
