import { useReferenceModel } from '@/query/reference/core/use-reference-model';
import type { ReferenceFetchInfo } from '@/query/reference/types/reference-type';
import type { MetricModel } from '@/schema/inventory/metric/model';

import type { MetricReferenceItem } from '@/store/reference/metric-reference-store';



export const useMetricReferenceModel = () => {
    const { metricAPI } = useMetricApi();

    const fetchInfo: ReferenceFetchInfo<MetricModel> = {
        listFetchFn: metricAPI.list,
        name: 'Metric',
        idKey: 'metric_id',
        nameKey: 'name',
        only: ['metric_id', 'name', 'namespace_id', 'is_managed', 'resource_type', 'unit', 'labels_info', 'resource_group'],
        searchTargets: ['name'],
        nameFormatter: (data: MetricModel) => data.name,
    };

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

    return useReferenceModel<MetricModel, MetricReferenceItem>(
        'metric',
        fetchInfo,
        setMetricReferenceData,
    );
};
