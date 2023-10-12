import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

export const COST_VARIABLE_TYPE_INFO = {
    cost_product: {
        type: 'cost_product',
        key: 'product',
        name: 'Product (Cost)',
    },
    cost_usage_type: {
        type: 'cost_usage_type',
        key: 'usage_type',
        name: 'Type',
    },
    cost_data_source: REFERENCE_TYPE_INFO.cost_data_source,
} as const;
