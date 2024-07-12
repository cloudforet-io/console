<script setup lang="ts">
import { PSelectDropdown } from '@cloudforet/mirinae';

import type { LSBItem } from '@/common/modules/navigations/lsb/type';

interface Props {
    item: LSBItem;
}

const props = withDefaults(defineProps<Props>(), {
    item: () => ({}) as LSBItem,
});

const emit = defineEmits<{(e: 'select', id: string, selected: string|number): void}>();

const handleSelect = (id: string, selected: string) => {
    emit('select', id, selected);
};
</script>

<template>
    <div class="l-s-b-dropdown-menu-item">
        <p-select-dropdown class="select-options-dropdown"
                           :menu="props.item.selectOptions.items"
                           :selected="props.item.selectOptions.defaultSelected"
                           @update:selected="handleSelect(props.item.id, $event)"
        />
    </div>
</template>

<style scoped lang="postcss">
.l-s-b-dropdown-menu-item {
    padding: 0 0.5rem;
    .select-options-dropdown {
        @apply w-full;
    }
}
</style>
