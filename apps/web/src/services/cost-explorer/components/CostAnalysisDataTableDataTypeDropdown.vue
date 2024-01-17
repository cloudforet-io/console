<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import {
    useCostDataSourceReferenceStore,
} from '@/store/reference/cost-data-source-reference-store';

import type { DisplayDataType } from '@/services/cost-explorer/types/cost-explorer-query-type';

const emit = defineEmits<{(e: 'update-display-data-type', selected: DisplayDataType): void; }>();


interface MenuItem extends SelectDropdownMenuItem {
    name: DisplayDataType;
}

interface Props {
    dataSourceId?: string;
}

const props = defineProps<Props>();

const costDataSourceReferenceStore = useCostDataSourceReferenceStore();

const state = reactive({
    costDataSource: computed<CostDataSourceReferenceMap>(() => (props.dataSourceId ? costDataSourceReferenceStore.getters.costDataSourceItems[props.dataSourceId] : undefined)),
    additionalMenuItems: computed<MenuItem[]>(() => {
        if (state.costDataSource) {
            return (state.costDataSource.data?.cost_data_keys ?? []).map((key) => ({
                type: 'item',
                name: key,
                label: key,
            }));
        } return [];
    }),
    headerMenuItems: computed<MenuItem[]>(() => [
        { type: 'item', name: 'cost', label: 'Cost' },
        { type: 'item', name: 'usage', label: 'Usage' },
        ...state.additionalMenuItems,
    ]),
    selected: 'cost' as DisplayDataType,
});

const handleUpdateSelected = (selected: DisplayDataType) => {
    state.selected = selected;
    emit('update-display-data-type', selected);
};

watch(() => props.dataSourceId, () => {
    state.selected = 'cost';
});

</script>

<template>
    <p-select-dropdown :selected="state.selected"
                       :menu="state.headerMenuItems"
                       style-type="transparent"
                       @update:selected="handleUpdateSelected"
    />
</template>
