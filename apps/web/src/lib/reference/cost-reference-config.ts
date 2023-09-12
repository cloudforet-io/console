import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

export const COST_VARIABLE_TYPE_INFO = {
    cost_product: {
        type: 'cost_product',
        key: 'product',
        name: 'Product (Cost)',
    },
    cost_category: {
        type: 'cost_category',
        key: 'category',
        name: 'Category',
    },
    cost_resource_group: {
        type: 'cost_resource_group',
        key: 'resource_group',
        name: 'Resource Group',
    },
    cost_type: {
        type: 'cost_type',
        key: 'usage_type',
        name: 'Type',
    },
    cost_account: {
        type: 'cost_account',
        key: 'account',
        name: 'AWS Account ID (Cost)',
    },
    cost_data_source: REFERENCE_TYPE_INFO.cost_data_source,
} as const;
