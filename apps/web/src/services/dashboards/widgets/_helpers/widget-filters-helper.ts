import { ASSET_REFERENCE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { COST_REFERENCE_TYPE_INFO } from '@/lib/reference/cost-reference-config';
import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

export const getWidgetFilterDataKey = (filterKey: string) => {
    if (REFERENCE_TYPE_INFO[filterKey]) return REFERENCE_TYPE_INFO[filterKey].key;
    if (COST_REFERENCE_TYPE_INFO[filterKey]) return COST_REFERENCE_TYPE_INFO[filterKey].key;
    if (ASSET_REFERENCE_TYPE_INFO[filterKey]) return ASSET_REFERENCE_TYPE_INFO[filterKey].key;
    return filterKey;
};
