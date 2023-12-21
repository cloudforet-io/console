<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, reactive, ref,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PContextMenu, PI } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';

interface Props {
    isAdminMode: boolean;
    menu: MenuItem[];
    selectedMenuId?: string;
}

interface Emits {
    (e: 'select-menu', menuId?: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const route = useRoute();

const state = reactive({
    isVisibleMenu: false,
    matchedPaths: computed(() => route.matched),
    selectedMenu: computed(() => {
        const selected = props.menu.find((item) => {
            const matchedPaths = state.matchedPaths;
            return matchedPaths.some((matchedPath) => matchedPath.meta?.menuId === item.name) && item.type === 'item';
        });
        return selected ? [selected] : [];
    }),
});

const hideMenu = () => {
    if (state.isVisibleMenu) {
        state.isVisibleMenu = false;
    }
};
const containerRef = ref<HTMLElement|null>(null);
onClickOutside(containerRef, hideMenu);

const handleOpenMenu = () => {
    state.isVisibleMenu = !state.isVisibleMenu;
};
const handleSelectMenu = (menu: MenuItem[]) => {
    if (!menu || !menu.length) return;
    const menuId = menu[0].name;
    emit('select-menu', menuId);
    hideMenu();
};

</script>

<template>
    <div ref="containerRef"
         class="g-n-b-invisible-menu-dropdown"
    >
        <div class="dropdown-button"
             @click="handleOpenMenu"
        >
            <span :class="{'button-text': true, 'is-admin': isAdminMode}">...</span>
            <span :class="{'arrow-button': true, 'opened': state.isVisibleMenu, 'is-admin': isAdminMode}">
                <p-i :name="state.isVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                     width="1.5rem"
                     height="1.5rem"
                     color="inherit"
                />
            </span>
        </div>
        <p-context-menu v-if="state.isVisibleMenu"
                        class="dropdown-context-menu"
                        :menu="props.menu"
                        :selected="state.selectedMenu"
                        @update:selected="handleSelectMenu"
        />
    </div>
</template>

<style lang="postcss" scoped>
.g-n-b-invisible-menu-dropdown {
    @apply inline-flex items-center relative;
    width: 4rem;
    padding: 0 0.5rem 0 1rem;

    .dropdown-button {
        @apply inline-flex items-center gap-1;
        .button-text {
            @apply text-label-md text-gray-600;

            &.is-admin {
                @apply text-white;
            }
        }
        .arrow-button {
            @apply inline-flex items-center text-gray-600 cursor-pointer;
            width: 1.5rem;

            &.opened {
                @apply text-blue-600;
            }
            &.is-admin {
                @apply text-white;
            }
        }
    }

    .dropdown-context-menu {
        @apply absolute;
        top: $gnb-height;
        margin-top: -0.5rem;
        left: 0.5rem;
        z-index: 1000;
        min-width: 9rem;
        width: auto;
    }

    @screen mobile {
        @apply hidden;
    }
}
</style>
