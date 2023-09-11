import { ASSET_VARIABLE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { COST_VARIABLE_TYPE_INFO } from '@/lib/reference/cost-reference-config';
import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

export const getWidgetFilterDataKey = (filterKey: string) => {
    if (REFERENCE_TYPE_INFO[filterKey]) return REFERENCE_TYPE_INFO[filterKey].key;
    if (COST_VARIABLE_TYPE_INFO[filterKey]) return COST_VARIABLE_TYPE_INFO[filterKey].key;
    if (ASSET_VARIABLE_TYPE_INFO[filterKey]) return ASSET_VARIABLE_TYPE_INFO[filterKey].key;
    return filterKey;
};
