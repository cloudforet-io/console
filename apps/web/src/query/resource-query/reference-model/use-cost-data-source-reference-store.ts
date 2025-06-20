import type { CostDataSourceModel } from '@/api-clients/cost-analysis/data-source/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

export type CostDataSourceReferenceItem = ReferenceItem<CostDataSourceModel>;
export type CostDataSourceReferenceMap = ReferenceMap<CostDataSourceReferenceItem>;

export const useCostDataSourceReferenceModel = () => {
    const fetchOptions = {
        // TODO: check why costDataSource needs sort query (cost-data-source-reference-store)
        only: ['data_source_id', 'name', 'plugin_info', 'cost_additional_info_keys', 'cost_tag_keys', 'workspace_id', 'cost_data_keys', 'permissions'],
    };

    const {
        referenceMap,
    } = useReferenceDataModel<CostDataSourceModel, CostDataSourceReferenceItem>(
        RESOURCE_CONFIG_MAP.costDataSource.resourceKey,
        (costDataSourceInfo: CostDataSourceModel) => ({
            key: costDataSourceInfo.data_source_id,
            label: costDataSourceInfo.name,
            name: costDataSourceInfo.name,
            data: costDataSourceInfo,
        }),
        fetchOptions,
    );

    return {
        map: referenceMap,
    };
};
