import { mapKeys } from 'lodash';

import type { MetricDataAnalyzeResult } from '@/services/asset-inventory/types/asset-analysis-type';

export const convertFormKeys = (data: MetricDataAnalyzeResult) => {
    const convertFormKey = (key: string) => key.toLowerCase().replace(/ /g, '_');

    return data.map((item) => mapKeys(item, (value, key) => convertFormKey(key)));
};
