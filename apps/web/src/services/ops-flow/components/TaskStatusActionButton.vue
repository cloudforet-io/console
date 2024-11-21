<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref, computed } from 'vue';

import { PIconButton, PContextMenu, useContextMenuStyle } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';

const props = defineProps<{
    id: string;
}>();

const taskCategoryPageStore = useTaskCategoryPageStore();

const containerRef = ref<HTMLElement|null>(null);
const targetRef = ref<HTMLElement|null>(null);
const menuRef = ref<any|null>(null);
const visibleMenu = ref<boolean>(false);
useContextMenuStyle({
    targetRef,
    menuRef,
    visibleMenu,
    useFixedMenuStyle: true,
    position: 'right',
    menuWidth: '192px',
});
const menu = computed<MenuItem[]>(() => [
    { name: 'edit', icon: 'ic_edit', label: 'Edit' },
    { name: 'delete', icon: 'ic_delete', label: 'Delete' },
]);
const toggleMenu = () => {
    visibleMenu.value = !visibleMenu.value;
};
const hideMenu = () => {
    visibleMenu.value = false;
};
onClickOutside(containerRef, hideMenu);

const handleSelectMenu = (item: MenuItem) => {
    if (item.name === 'edit') {
        taskCategoryPageStore.openEditStatusForm(props.id);
    } else if (item.name === 'delete') {
        taskCategoryPageStore.openDeleteStatusModal(props.id);
    }
    hideMenu();
};
</script>

<template>
    <span ref="containerRef"
          class="relative"
    >
        <p-icon-button ref="targetRef"
                       name="ic_ellipsis-horizontal"
                       @click="toggleMenu"
        />
        <p-context-menu v-show="visibleMenu"
                        ref="menuRef"
                        :menu="menu"
                        :selected="[]"
                        class="action-menu"
                        @select="handleSelectMenu"
        />
    </span>
</template>

<style scoped lang="postcss">
.action-menu {
    @apply bg-white;
    z-index: 1;
}
</style>
