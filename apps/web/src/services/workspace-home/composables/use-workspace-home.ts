import { mapKeys } from 'lodash';

import type { MetricDataAnalyzeResult } from '@/services/asset-inventory/types/asset-analysis-type';
import {
    COST_SUMMARY_STATE_COLOR,
    SERVICE_ACCOUNT_SUMMARY_STATE_COLOR,
} from '@/services/workspace-home/constants/workspace-home-constant';

export const convertFormKeys = (data: MetricDataAnalyzeResult) => {
    const convertFormKey = (key: string) => key.toLowerCase().replace(/ /g, '_');

    return data.map((item) => mapKeys(item, (value, key) => convertFormKey(key)));
};
const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});
export const serviceAccountStateSummaryFormatter = colorBindFactory(SERVICE_ACCOUNT_SUMMARY_STATE_COLOR, (value) => value.toLowerCase());
export const costStateSummaryFormatter = colorBindFactory(COST_SUMMARY_STATE_COLOR, (value) => value.toLowerCase());

