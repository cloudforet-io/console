<script setup lang="ts">
import {
    reactive, computed, ref,
} from 'vue';

import { includes } from 'lodash';

import { store } from '@/store';

import { ROOT_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import type { MenuId } from '@/lib/menu/config';

import TopBarWorkspaces from '@/common/modules/navigations/top-bar/modules/top-bar-header/TopBarWorkspaces.vue';
import TopBarSearch from '@/common/modules/navigations/top-bar/modules/top-bar-search/TopBarSearch.vue';
import TopBarToolset from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/TopBarToolset.vue';

const ALLOWED_MENUS_FOR_ALL_USERS = ['notifications', 'support', 'profile'];

const appContextStore = useAppContextStore();

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    openedMenu: '',
    hasPermission: computed((() => store.getters['user/hasPermission'])),
    logoLink: computed(() => {
        if (state.isAdminMode) return { name: ROOT_ROUTE.ADMIN._NAME };
        return null;
    }),
});

const topBarRef = ref<HTMLElement|null>(null);
const topBarWorkspaceRef = ref<InstanceType<typeof TopBarWorkspaces>>();

/* event */
const hideMenu = () => {
    state.openedMenu = '';
};
const handleOpenMenu = (menuId: MenuId) => {
    if (state.openedMenu === menuId) {
        hideMenu();
    } else if (state.hasPermission || includes(ALLOWED_MENUS_FOR_ALL_USERS, menuId)) {
        state.openedMenu = menuId;
    }
};
</script>

<template>
    <div ref="topBarRef"
         :class="{'top-bar': true, 'admin-top-bar': state.isAdminMode}"
    >
        <top-bar-workspaces ref="topBarWorkspaceRef"
                            :to="state.logoLink"
                            :is-admin-mode="state.isAdminMode"
                            class="top-bar-workspace"
        />
        <div class="middle-section">
            <top-bar-search v-if="!state.isAdminMode"
                            class="top-bar-search"
            />
        </div>

        <top-bar-toolset ref="topBarToolsetRef"
                         class="toolset"
                         :opened-menu="state.openedMenu"
                         @open-menu="handleOpenMenu"
                         @hide-menu="hideMenu"
        />
    </div>
</template>

<style lang="postcss" scoped>
.top-bar {
    @apply bg-white items-center border-b border-gray-200;
    display: flex !important;
    width: 100%;

    &.admin-top-bar {
        @apply bg-violet-900;
        background: linear-gradient(90deg, #2c0f66 14.69%, #7d5dd2 100%);
        box-shadow: 0 0.125rem 0.25rem 0 rgba(0, 0, 0, 0.12);
    }

    .top-bar-workspace {
        flex: 0 0;
    }

    .middle-section {
        @apply flex justify-center;
        flex: 1 1;
    }

    .toolset {
        @apply inline-flex items-center;
        right: 0;
        padding-right: 1.5rem;
        flex: 0 0;
    }
}

@screen mobile {
    .top-bar {
        .middle-section {
            @apply justify-end;
        }
    }
}
</style>
