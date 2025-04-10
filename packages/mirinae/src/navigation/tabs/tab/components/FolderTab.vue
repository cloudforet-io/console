<script setup lang="ts">


import {
    computed, reactive, ref, toRef,
} from 'vue';

import { onClickOutside } from '@vueuse/core';

import PContextMenu from '@/controls/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/controls/context-menu/type';
import PI from '@/foundation/icons/PI.vue';
import { useContextMenuStyle } from '@/hooks';
import type { TabItem } from '@/navigation/tabs/tab/type';

interface Props {
    tab: TabItem;
    activeTab: string;
    selectedFolderTab?: string;
    selectedContextMenuItem?: MenuItem;
    visibleSubMenu?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'select-tab'): void;
    (e: 'select-tab-menu', value: MenuItem, idx?: number): void;
}>();

const folderTabRef = ref<HTMLElement | null>(null);
const contextMenuRef = ref<HTMLElement | null>(null);

const state = reactive({
    visible: props.visibleSubMenu,
});

const menuItems = computed<MenuItem[]>(() => {
    if (!props.tab?.subItems) return [];
    return props.tab.subItems.map((item) => {
        if (typeof item === 'string') {
            return { name: item, label: item };
        }
        return item as unknown as MenuItem;
    });
});

const handleSelectTab = () => {
    if (state.visible) {
        state.visible = false;
    } else {
        state.visible = true;
    }
    emit('select-tab');
};

const handleSelectTabMenu = (menu: MenuItem, index: number) => {
    state.visible = false;
    emit('select-tab-menu', menu, index);
};

const {
    contextMenuStyle,
} = useContextMenuStyle({
    useFixedMenuStyle: true,
    visibleMenu: toRef(state, 'visible'),
    targetRef: folderTabRef,
    position: 'left',
    menuRef: contextMenuRef,
});

onClickOutside(folderTabRef, () => {
    state.visible = false;
});

</script>

<template>
    <li ref="folderTabRef"
        :class="{
            'folder-tab': true,
            active: props.tab.subItems?.some((subItem) => typeof subItem !== 'string' && activeTab === subItem.name)
        }"
        role="tab"
        @keydown.enter="handleSelectTab"
        @click="handleSelectTab"
    >
        <div class="content-wrapper">
            <p-i v-if="props.tab.icon"
                 class="folder-tab-icon"
                 :name="props.tab.icon"
                 width="0.875rem"
                 height="0.875rem"
                 color="gray-600"
            />
            <span class="label">
                {{ tab.label }}
            </span>
            <p-i class="sub-item-dropdown-icon"
                 :name="state.visible ? 'ic_chevron-up' : 'ic_chevron-down'"
                 width="1.25rem"
                 height="1.25rem"
                 color="gray-600"
            />
        </div>
        <p-context-menu v-if="state.visible"
                        ref="contextMenuRef"
                        class="sub-item-menu"
                        :style="contextMenuStyle"
                        :menu="menuItems"
                        :selected="props.selectedContextMenuItem ? [props.selectedContextMenuItem]: undefined"
                        @select="handleSelectTabMenu"
        />
    </li>
</template>

<style lang="postcss">
.folder-tab {
    &.active {
        @apply text-primary border-primary;
    }
    .content-wrapper {
        @apply flex items-center justify-center w-full h-full;
        .folder-tab-icon {
            min-width: 0.875rem;
            margin-right: 0.25rem;
        }
        .label {
            @apply w-full text-label-md block truncate;
        }
        .sub-item-dropdown-icon {
            min-width: 1.25rem;
            margin-left: 0.25rem;
        }
        .sub-item-menu {
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 100;
            width: max-content;
        }
    }
}
</style>
