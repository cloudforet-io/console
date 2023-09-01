<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

interface Props {
    items: MenuItem[];
    selected: string;
}
const props = defineProps<Props>();
const emit = defineEmits(['select']);

const handleSelectItem = (selected: string) => {
    emit('select', selected);
};
</script>

<template>
    <p-select-dropdown :selected="selected"
                       :items="props.items"
                       style-type="transparent"
                       class="widget-frame-header-dropdown"
                       @select="handleSelectItem"
    />
</template>
