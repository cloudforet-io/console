<template>
    <vertical-page-layout :min-width="0" :init-width="260" :max-width="400">
        <template #sidebar>
            <p class="sidebar-title-text">
                {{ $t('MENU.AUTOMATION.SPOT_AUTOMATION') }}
            </p>
            <p-divider class="sidebar-divider" />
            <aside v-for="(item) in menuList" :key="item.label"
                   class="menu-item"
                   :class="{'selected': item.label === selectedItem.label}"
                   @click="showPage(item.routeName)"
            >
                {{ item.label }}
            </aside>
        </template>
        <template #default>
            <router-view />
        </template>
    </vertical-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import VerticalPageLayout from '@/common/components/layouts/VerticalPageLayout.vue';
import VueI18n from 'vue-i18n';
import { PDivider } from '@spaceone/design-system';

import TranslateResult = VueI18n.TranslateResult;

interface MenuItem {
    routeName: string;
    label: TranslateResult;
}

export default {
    name: 'SpotAutomationMainPage',
    components: { VerticalPageLayout, PDivider },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            menuList: [
                {
                    routeName: 'spotDashboard',
                    label: vm.$t('AUTOMATION.SPOT_AUTOMATION.MAIN.DASHBOARD'),
                },
                {
                    routeName: 'spotGroup',
                    label: vm.$t('AUTOMATION.SPOT_AUTOMATION.MAIN.SPOT_GROUP'),
                },
            ] as MenuItem[],
            selectedItem: {} as MenuItem,
        });
        const showPage = (routeName) => {
            vm.$router.replace({ name: routeName }).catch(() => {});
        };
        const selectSidebarItem = (route) => {
            if (route) state.selectedItem = state.menuList.find(d => d.routeName === route) as MenuItem;
        };

        watch(() => vm.$route.name, (after) => {
            selectSidebarItem(after);
        });

        (async () => {
            selectSidebarItem(vm.$route.name);
        })();

        return {
            ...toRefs(state),
            showPage,
        };
    },
};
</script>

<style lang="postcss" scoped>
.sidebar-title-text {
    @apply font-bold;
    font-size: 0.875rem;
    line-height: 140%;
    margin: 2rem 0 0.5rem 1rem;
}

.sidebar-divider {
    @apply w-full;
    margin-bottom: 0.75rem;
}
.menu-item {
    @apply text-gray-900 truncate;
    width: 14.75rem;
    height: 2rem;
    font-size: 0.875rem;
    line-height: 140%;
    padding: 0.375rem 1rem;
    margin-left: 0.75rem;
    margin-right: 0.75rem;
    &:hover {
        @apply bg-blue-100 cursor-pointer;
    }
    &:active {
        @apply bg-blue-200 text-blue-500 cursor-pointer;
    }
    &.selected {
        @apply bg-blue-200 text-blue-500 cursor-pointer;
    }
}
</style>
