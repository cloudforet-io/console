import { STATIC_GROUP_BY } from '@/services/asset-inventory/constants/metric-explorer-constant';
import type { StaticGroupBy } from '@/services/asset-inventory/types/metric-explorer-type';


export const getRefinedMetricDataAnalyzeQueryGroupBy = (groupBy: string|StaticGroupBy): string => {
    if (Object.values(STATIC_GROUP_BY).includes(groupBy)) return groupBy;
    return `labels.${groupBy}`;
};
