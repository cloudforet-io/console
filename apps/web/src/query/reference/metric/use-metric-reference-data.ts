import { useMetricApi } from '@/api-clients/inventory/metric/composables/use-metric-api';
import type { MetricModel } from '@/schema/inventory/metric/model';

import type { MetricReferenceItem } from '@/store/reference/metric-reference-store';

import { useReferenceData } from '../_core/use-reference-data';

export const useMetricReferenceData = () => {
    const { metricAPI } = useMetricApi();

    // transform
    const setMetricReferenceData = (metricInfo: MetricModel): MetricReferenceItem => ({
        key: metricInfo.metric_id,
        label: metricInfo.name,
        name: metricInfo.name,
        data: {
            namespace_id: metricInfo.namespace_id,
            is_managed: metricInfo.is_managed,
            resource_type: metricInfo.resource_type,
            resource_group: metricInfo.resource_group,
            unit: metricInfo.unit,
            labels_info: metricInfo.labels_info,
        },
    });

    return useReferenceData<MetricModel, MetricReferenceItem>(
        'metric',
        metricAPI.list,
        setMetricReferenceData,
    );
};
