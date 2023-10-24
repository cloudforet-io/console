import type { EnumModelOptions, SearchResourceModelOptions, ReferenceResourceModelOptions } from '@/models/widget';

import { ASSET_VARIABLE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { COST_VARIABLE_TYPE_INFO } from '@/lib/reference/cost-reference-config';
import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

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

export const ResourceReferenceSchema:WidgetOptionsSchemaConfig = [
    {
        key: REFERENCE_TYPE_INFO.provider.type,
        name: REFERENCE_TYPE_INFO.provider.name,
        selection_type: 'MULTI',
    },
    {
        key: REFERENCE_TYPE_INFO.project.type,
        name: REFERENCE_TYPE_INFO.project.name,
        selection_type: 'MULTI',
    },
    {
        key: REFERENCE_TYPE_INFO.service_account.type,
        name: REFERENCE_TYPE_INFO.service_account.name,
        selection_type: 'MULTI',
    },
    {
        key: REFERENCE_TYPE_INFO.project_group.type,
        name: REFERENCE_TYPE_INFO.project_group.name,
        selection_type: 'MULTI',
    },
    {
        key: REFERENCE_TYPE_INFO.region.type,
        name: REFERENCE_TYPE_INFO.region.name,
        selection_type: 'MULTI',
    },
];
export const CostReferenceSchema:WidgetOptionsSchemaConfig = [
    {
        key: COST_VARIABLE_TYPE_INFO.cost_data_source.type,
        name: COST_VARIABLE_TYPE_INFO.cost_data_source.name,
        selection_type: 'SINGLE',
    },
    {
        key: COST_VARIABLE_TYPE_INFO.cost_product.type,
        name: COST_VARIABLE_TYPE_INFO.cost_product.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'SEARCH_RESOURCE', resource_type: 'cost_analysis.Cost', resource_key: COST_VARIABLE_TYPE_INFO.cost_product.key },
        ],
    },
    {
        key: COST_VARIABLE_TYPE_INFO.cost_usage_type.type,
        name: COST_VARIABLE_TYPE_INFO.cost_usage_type.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'SEARCH_RESOURCE', resource_type: 'cost_analysis.Cost', resource_key: COST_VARIABLE_TYPE_INFO.cost_usage_type.key },
        ],
    },
];

export const AssetReferenceSchema:WidgetOptionsSchemaConfig = [
    {
        key: ASSET_VARIABLE_TYPE_INFO.asset_query_set.type,
        name: ASSET_VARIABLE_TYPE_INFO.asset_query_set.name,
        selection_type: 'MULTI',
    },
    {
        key: ASSET_VARIABLE_TYPE_INFO.asset_account.type,
        name: ASSET_VARIABLE_TYPE_INFO.asset_account.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'SEARCH_RESOURCE', resource_type: 'inventory.CloudService', resource_key: ASSET_VARIABLE_TYPE_INFO.asset_account.key },
        ],
    },
];

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
