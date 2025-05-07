<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref, computed, toRef } from 'vue';

import { PIconButton, PContextMenu, useContextMenuStyle } from '@cloudforet/mirinae';
import type { IconButtonSize, IconButtonStyleType } from '@cloudforet/mirinae/types/controls/buttons/icon-button/type';
import type { ContextMenuPosition } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import type { ActionMenuItem } from './type';


type SupportMenu = 'edit' | 'delete';
const props = withDefaults(defineProps<{
    menu?: Array<SupportMenu|ActionMenuItem>;
    styleType?: IconButtonStyleType;
    size?: IconButtonSize;
    position?: ContextMenuPosition;
}>(), {
    menu: undefined,
    styleType: 'transparent',
    size: 'md',
    position: 'right',
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
    position: toRef(props, 'position'),
    menuWidth: props.size === 'sm' ? '113px' : '192px',
});
const menuMap = computed<Record<SupportMenu, ActionMenuItem>>(() => ({
    edit: { name: 'edit', icon: 'ic_edit', label: i18n.t('COMMON.BUTTONS.EDIT') },
    delete: { name: 'delete', icon: 'ic_delete', label: i18n.t('COMMON.BUTTONS.DELETE') },
}));
const menu = computed<ActionMenuItem[]>(() => {
    if (props.menu) {
        return props.menu.map((item) => {
            if (typeof item === 'string') {
                return menuMap.value[item];
            }
            return item;
        });
    }
    return [
        { name: 'edit', icon: 'ic_edit', label: i18n.t('COMMON.BUTTONS.EDIT') },
        { name: 'delete', icon: 'ic_delete', label: i18n.t('COMMON.BUTTONS.DELETE') },
    ];
});
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
          class="action-menu-button"
    >
        <p-icon-button ref="targetRef"
                       name="ic_ellipsis-horizontal"
                       :style-type="props.styleType"
                       :size="props.size"
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
.action-menu-button {
    >.action-menu {
        @apply bg-white;
        z-index: 1;
    }
}
</style>
