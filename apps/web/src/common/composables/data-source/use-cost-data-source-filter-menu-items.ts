import type { ComputedRef } from 'vue';
import { computed, reactive, watch } from 'vue';

import { isEmpty, sortBy } from 'lodash';

import type { MenuItem } from '@cloudforet/mirinae/src/inputs/context-menu/type';

import type { CostDataSourceItems } from '@/store/reference/cost-data-source-reference-store';

import CostTagKeyVariableModel
    from '@/lib/variable-models/managed-model/custom-resource-model/cost-tag-key-variable-model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';



interface UseCostDataSourceFilterMenuItems {
    isAdminMode: ComputedRef<boolean>;
    costDataSource: ComputedRef<CostDataSourceItems|undefined>;
}
interface UseCostDataSourceFiltersReturn {
    menuItems: ComputedRef<MenuItem[]>;
}
export const useCostDataSourceFilterMenuItems = ({
    isAdminMode, costDataSource,
}: UseCostDataSourceFilterMenuItems): UseCostDataSourceFiltersReturn => {
    const state = reactive({
        managedGroupByItems: computed<MenuItem[]>(() => {
            if (isAdminMode) return Object.values(GROUP_BY_ITEM_MAP);
            return Object.values(GROUP_BY_ITEM_MAP).filter((item) => item.name !== 'workspace_id');
        }),
        additionalInfoGroupByItems: computed<MenuItem[]>(() => {
            if (!costDataSource) return [];
            const additionalInfo = costDataSource.value?.data?.plugin_info?.metadata?.additional_info;
            if (additionalInfo && !isEmpty(additionalInfo)) {
                return sortBy(Object.entries(additionalInfo).map(([k]) => ({
                    name: `additional_info.${k}`,
                    label: k,
                    presetKeys: additionalInfo[k].enums,
                })), 'label');
            }
            return sortBy((costDataSource.value?.data?.cost_additional_info_keys ?? [])
                .map((key) => ({
                    name: `additional_info.${key}`,
                    label: key,
                })), 'label');
        }),
        tagsFilterItems: [] as MenuItem[],
        menuItems: computed<MenuItem[]>(() => ([
            ...state.managedGroupByItems,
            ...state.additionalInfoGroupByItems,
            ...state.tagsFilterItems,
        ])),
    });

    const setTagsResources = async (): Promise<void> => {
        try {
            const options = {
                cost_data_source: costDataSource.value?.key,
            };
            const costTagKeyVariableModel = new CostTagKeyVariableModel();
            const response = await costTagKeyVariableModel.list({ options });
            state.tagsFilterItems = response.results ? response.results.map((d) => ({ name: d.key, label: d.name })) : [];
        } catch (e: any) {
            ErrorHandler.handleError(e);
            state.tagsFilterItems = [];
        }
    };

    watch(() => costDataSource.value, async (_costDataSource) => {
        if (_costDataSource) {
            await setTagsResources();
        }
    }, { immediate: true });

    return {
        menuItems: computed(() => state.menuItems),
    };
};
