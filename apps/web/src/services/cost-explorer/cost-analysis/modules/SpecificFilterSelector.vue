<script setup lang="ts">
import { reactive } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';

import type { SpecificFilter } from '@/services/cost-explorer/lib/config';
import { SPECIFIC_FILTER_MAP } from '@/services/cost-explorer/lib/config';

const emit = defineEmits<{(e: 'update-specific-filter', selected: SpecificFilter): void; }>();

const state = reactive({
    headerMenuItems: [
        { type: 'item', name: SPECIFIC_FILTER_MAP.cost, label: 'Cost' },
        { type: 'item', name: SPECIFIC_FILTER_MAP.usage, label: 'Usage' },
    ],
    selected: SPECIFIC_FILTER_MAP.cost as SpecificFilter,
});

const handleUpdateSelected = (selected: SpecificFilter) => {
    state.selected = selected;
    emit('update-specific-filter', selected);
};

</script>

<template>
    <p-select-dropdown :selected="state.selected"
                       :menu="state.headerMenuItems"
                       style-type="transparent"
                       @update:selected="handleUpdateSelected"
    />
</template>
