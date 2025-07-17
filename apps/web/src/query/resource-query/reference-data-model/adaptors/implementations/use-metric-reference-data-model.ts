import { useMetricApi } from '@/api-clients/inventory/metric/composables/use-metric-api';
import type { MetricModel } from '@/api-clients/inventory/metric/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type MetricReferenceItem = ReferenceItem<MetricModel>;
export type MetricReferenceMap = ReferenceMap<MetricReferenceItem>;

export const useMetricReferenceDataModel = () => {
    const { metricAPI } = useMetricApi();
    const fetchConfig: ReferenceDataModelFetchConfig<MetricModel> = {
        listFetcher: metricAPI.list,
        query: {
            only: ['metric_id', 'name', 'namespace_id', 'is_managed', 'resource_type', 'unit', 'labels_info', 'resource_group'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<MetricModel, MetricReferenceItem>(
        RESOURCE_CONFIG_MAP.metric.resourceKey,
        (metricInfo: MetricModel) => ({
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
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
