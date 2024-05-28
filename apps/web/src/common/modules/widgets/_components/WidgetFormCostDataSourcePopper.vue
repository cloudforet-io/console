<script lang="ts" setup>
import {
    computed, onMounted, reactive, toRef, watch,
} from 'vue';

import {
    PFieldTitle, PContextMenu, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { debounce } from 'lodash';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import { VariableModelFactory } from '@/lib/variable-models';
import type {
    VariableModelMenuHandlerInfo,
} from '@/lib/variable-models/variable-model-menu-handler';
import {
    getVariableModelMenuHandler,
} from '@/lib/variable-models/variable-model-menu-handler';

import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    selectedCostDataSourceId?: string;
    selectedCostDataType?: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:selected-cost-data-source-id', costDataSourceId: string): void;
    (e: 'update:selected-cost-data-type', costDataType: string): void;
}>();


const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    proxySelectedCostDataSourceId: useProxyValue('selectedCostDataSourceId', props, emit),
    proxySelectedCostDataType: useProxyValue('selectedCostDataType', props, emit),
    // data source
    selectedDataSource: [] as MenuItem[],
    dataSourceMenuHandler: computed<AutocompleteHandler>(() => {
        const variableModelInfo: VariableModelMenuHandlerInfo = {
            variableModel: new VariableModelFactory({ type: 'MANAGED', managedModelKey: 'cost_data_source' }),
        };
        return getVariableModelMenuHandler([variableModelInfo]);
    }),
    dataSourceSearchText: '',
    // data type
    dataTypeMenuItems: computed<MenuItem[]>(() => {
        if (!state.selectedDataSource.length) return [];
        const targetCostDataSource = storeState.costDataSource[state.selectedDataSource[0].name];
        const costAlias: string|undefined = targetCostDataSource?.data?.plugin_info?.metadata?.alias?.cost;
        const usageAlias: string|undefined = targetCostDataSource?.data?.plugin_info?.metadata?.alias?.usage;
        const additionalMenuItems: MenuItem[] = targetCostDataSource.data?.cost_data_keys?.map((key) => ({
            type: 'item', name: key, label: key,
        }));
        return [
            { type: 'item', name: 'cost', label: costAlias ? `Cost (${costAlias})` : 'Cost' },
            { type: 'item', name: 'usage', label: usageAlias ? `Usage (${usageAlias})` : 'Usage' },
            ...(additionalMenuItems || []),
        ];
    }),
    selectedDataType: [] as MenuItem[],
});
const {
    refinedMenu,
    initiateMenu,
    reloadMenu,
} = useContextMenuController({
    targetRef: toRef(state, 'targetRef'),
    searchText: toRef(state, 'dataSourceSearchText'),
    handler: toRef(state, 'dataSourceMenuHandler'),
    selected: toRef(state, 'selectedDataSource'),
    pageSize: 10,
});

/* Event */
const handleUpdateCostDataSourceSearchText = debounce((text: string) => {
    state.dataSourceSearchText = text;
    reloadMenu();
}, 200);
const handleSelectDataSource = () => {
    state.selectedDataType = [];
};

onMounted(() => {
    state.selectedDataSource = [];
    state.selectedDataType = [];
    initiateMenu();
});

/* Watcher */
watch(() => state.selectedDataSource, (val) => {
    state.proxySelectedCostDataSourceId = val[0]?.name;
});
watch(() => state.selectedDataType, (val) => {
    state.proxySelectedCostDataType = val[0]?.name;
});
</script>

<template>
    <div class="widget-form-cost-data-source-popper">
        <div class="data-source-select-col">
            <p-field-title :label="i18n.t('Source')"
                           required
            />
            <p-context-menu :menu="refinedMenu"
                            :search-text="state.dataSourceSearchText"
                            searchable
                            :selected.sync="state.selectedDataSource"
                            @update:search-text="handleUpdateCostDataSourceSearchText"
                            @select="handleSelectDataSource"
            />
        </div>
        <div class="data-source-select-col">
            <p-field-title :label="i18n.t('Data Type')"
                           required
            />
            <p-context-menu :menu="state.dataTypeMenuItems"
                            :selected.sync="state.selectedDataType"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.widget-form-cost-data-source-popper {
    display: flex;
    width: 16rem;
    flex: 1;
    .data-source-select-col {
        @apply border-r border-gray-200;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 16rem;
        padding: 0.75rem;
        &:last-child {
            @apply border-r-0;
        }
    }
}

/* custom design-system component - p-context-menu */
:deep(.p-context-menu) {
    border: none;
}
</style>
