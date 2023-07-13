<script setup lang="ts">

import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { defineProps, defineEmits } from 'vue';

interface Props {
    items: MenuItem[];
    selected: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'select', value: string): void}>();

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

