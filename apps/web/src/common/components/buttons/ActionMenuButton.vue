<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref, computed } from 'vue';

import { PIconButton, PContextMenu, useContextMenuStyle } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

interface ActionMenuItem extends MenuItem {
    name: string;
}
const props = withDefaults(defineProps<{
    menu?: ActionMenuItem[];
}>(), {
    menu: undefined,
});
const emit = defineEmits<{(event: 'edit'): void;
    (event: 'delete'): void;
    (event: string): void; // for other menu names
}>();

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
const menu = computed<ActionMenuItem[]>(() => props.menu ?? [
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

const handleSelectMenu = (item: ActionMenuItem) => {
    emit(item.name);
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
