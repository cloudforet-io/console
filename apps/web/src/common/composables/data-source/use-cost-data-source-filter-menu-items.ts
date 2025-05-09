import type { ComputedRef } from 'vue';
import { computed, reactive, watch } from 'vue';

import { sortBy } from 'lodash';

import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { CostDataSourceItems } from '@/store/reference/cost-data-source-reference-store';

import CostTagKeyVariableModel
    from '@/lib/variable-models/managed-model/custom-resource-model/cost-tag-key-variable-model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { GROUP_BY_FILTER_ITEM_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';



interface CostDataSourceFilterMenuItem extends MenuItem {
    presetKeys?: string[];
    visible?: boolean;
}
interface UseCostDataSourceFilterMenuItems {
    isAdminMode: ComputedRef<boolean>;
    costDataSource: ComputedRef<CostDataSourceItems|undefined>;
}
interface UseCostDataSourceFiltersReturn {
    managedGroupByItems: ComputedRef<CostDataSourceFilterMenuItem[]>;
    additionalInfoGroupByItems: ComputedRef<CostDataSourceFilterMenuItem[]>; // metadataAdditionalInfoItems or costAdditionalInfoKeysItems
    metadataAdditionalInfoItems: ComputedRef<CostDataSourceFilterMenuItem[]>;
    costAdditionalInfoKeysItems: ComputedRef<CostDataSourceFilterMenuItem[]>;
    tagsFilterItems: ComputedRef<CostDataSourceFilterMenuItem[]>;
    allItems: ComputedRef<CostDataSourceFilterMenuItem[]>;
}
export const useCostDataSourceFilterMenuItems = ({
    isAdminMode, costDataSource,
}: UseCostDataSourceFilterMenuItems): UseCostDataSourceFiltersReturn => {
    const state = reactive({
        managedGroupByItems: computed<CostDataSourceFilterMenuItem[]>(() => {
            if (isAdminMode.value) return Object.values(GROUP_BY_FILTER_ITEM_MAP);
            return Object.values(GROUP_BY_FILTER_ITEM_MAP).filter((item) => item.name !== 'workspace_id');
        }),
        additionalInfoGroupByItems: computed<CostDataSourceFilterMenuItem[]>(() => {
            if (state.metadataAdditionalInfoItems.length) return state.metadataAdditionalInfoItems;
            return state.costAdditionalInfoKeysItems;
        }),
        metadataAdditionalInfoItems: computed<CostDataSourceFilterMenuItem[]>(() => {
            if (!costDataSource?.value) return [];
            const metadataAdditionalInfo = costDataSource.value?.data?.plugin_info?.metadata?.additional_info || {};
            const metadataAdditionalInfoItems: CostDataSourceFilterMenuItem[] = Object.entries(metadataAdditionalInfo)
                .map(([k]) => ({
                    name: `additional_info.${k}`,
                    label: k,
                    presetKeys: metadataAdditionalInfo[k].enums,
                    visible: metadataAdditionalInfo[k].visible,
                }));
            return sortBy(metadataAdditionalInfoItems, 'label');
        }),
        costAdditionalInfoKeysItems: computed<CostDataSourceFilterMenuItem[]>(() => {
            if (!costDataSource?.value) return [];
            const costAdditionalInfoKeys: string[] = costDataSource.value?.data?.cost_additional_info_keys ?? [];
            const costAdditionalInfoKeysItems: CostDataSourceFilterMenuItem[] = costAdditionalInfoKeys.map((key) => ({
                name: `additional_info.${key}`,
                label: key,
            }));
            return sortBy(costAdditionalInfoKeysItems, 'label');
        }),
        tagsFilterItems: [] as CostDataSourceFilterMenuItem[],
        allItems: computed<CostDataSourceFilterMenuItem[]>(() => ([
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
        managedGroupByItems: computed(() => state.managedGroupByItems),
        additionalInfoGroupByItems: computed(() => state.additionalInfoGroupByItems),
        metadataAdditionalInfoItems: computed(() => state.metadataAdditionalInfoItems),
        costAdditionalInfoKeysItems: computed(() => state.costAdditionalInfoKeysItems),
        tagsFilterItems: computed(() => state.tagsFilterItems),
        allItems: computed(() => state.allItems),
    };
};
