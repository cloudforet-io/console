<script setup lang="ts">
import { reactive } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';

import type { UsageTypeAdditionalFilter } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { USAGE_TYPE_ADDITIONAL_FILTER_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';

const emit = defineEmits<{(e: 'update-filter', selected: UsageTypeAdditionalFilter): void; }>();

// TODO: This component should be refactored with scalability
const state = reactive({
    headerMenuItems: [
        { type: 'item', name: USAGE_TYPE_ADDITIONAL_FILTER_MAP.cost, label: 'Cost' },
        { type: 'item', name: USAGE_TYPE_ADDITIONAL_FILTER_MAP.usage, label: 'Usage' },
    ],
    selected: USAGE_TYPE_ADDITIONAL_FILTER_MAP.cost as UsageTypeAdditionalFilter,
});

const handleUpdateSelected = (selected: UsageTypeAdditionalFilter) => {
    state.selected = selected;
    emit('update-filter', selected);
};

</script>

<template>
    <p-select-dropdown :selected="state.selected"
                       :menu="state.headerMenuItems"
                       style-type="transparent"
                       @update:selected="handleUpdateSelected"
    />
</template>
