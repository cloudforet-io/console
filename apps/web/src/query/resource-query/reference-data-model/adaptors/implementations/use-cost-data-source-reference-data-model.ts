import { useDataSourceApi } from '@/api-clients/cost-analysis/data-source/composables/use-data-source-api';
import type { CostDataSourceModel } from '@/api-clients/cost-analysis/data-source/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

export type CostDataSourceReferenceItem = ReferenceItem<CostDataSourceModel>;
export type CostDataSourceReferenceMap = ReferenceMap<CostDataSourceReferenceItem>;

export const useCostDataSourceReferenceModel = () => {
    const { dataSourceAPI } = useDataSourceApi();
    const fetchConfig: ReferenceDataModelFetchConfig<CostDataSourceModel> = {
        listFetcher: dataSourceAPI.list,
        query: {
            // TODO: check why costDataSource needs sort query (cost-data-source-reference-store)
            // sort: [{ key: 'workspace_id', desc: _state.isAdminMode }],
            only: ['data_source_id', 'name', 'plugin_info', 'cost_additional_info_keys', 'cost_tag_keys', 'workspace_id', 'cost_data_keys', 'permissions'],
        },
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
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
