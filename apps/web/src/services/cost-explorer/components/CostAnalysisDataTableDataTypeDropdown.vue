<script setup lang="ts">
import { reactive } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import type { DisplayDataType } from '@/services/cost-explorer/types/cost-explorer-query-type';

const emit = defineEmits<{(e: 'update-display-data-type', selected: DisplayDataType): void; }>();


interface MenuItem extends SelectDropdownMenuItem {
    name: DisplayDataType;
}
const state = reactive({
    headerMenuItems: [
        { type: 'item', name: 'cost', label: 'Cost' },
        { type: 'item', name: 'usage', label: 'Usage' },
    ] as MenuItem[],
    selected: 'cost' as DisplayDataType,
});

const handleUpdateSelected = (selected: DisplayDataType) => {
    state.selected = selected;
    emit('update-display-data-type', selected);
};

</script>

<template>
    <p-select-dropdown :selected="state.selected"
                       :menu="state.headerMenuItems"
                       style-type="transparent"
                       @update:selected="handleUpdateSelected"
    />
</template>
