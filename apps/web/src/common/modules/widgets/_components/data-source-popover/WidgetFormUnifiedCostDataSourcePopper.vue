<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import DataSelector from '@/common/components/select/DataSelector.vue';
import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    selectedCostDataType?: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:selected-cost-data-type', costDataType: string): void; }>();
const state = reactive({
    proxySelectedCostDataType: useProxyValue('selectedCostDataType', props, emit),
    // data type
    dataTypeMenuItems: computed<MenuItem[]>(() => [
        { type: 'item', name: 'cost', label: 'Cost' },
    ]),
    selectedDataType: [] as MenuItem[],
});

/* Watcher */
watch(() => state.selectedDataType, (val) => {
    state.proxySelectedCostDataType = val[0]?.name;
});
</script>

<template>
    <div class="widget-form-cost-data-source-popper">
        <div class="data-source-select-col">
            <data-selector :label="i18n.t('Data Type')"
                           :menu="state.dataTypeMenuItems"
                           @update:selected="state.selectedDataType = $event"
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
        padding: 0.75rem 0;
        &:last-child {
            @apply border-r-0;
        }
    }
}
</style>
