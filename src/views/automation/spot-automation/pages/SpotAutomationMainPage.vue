<template>
    <vertical-page-layout :min-width="0" :init-width="260" :max-width="400">
        <template #sidebar>
            <aside class="sidebar-menu">
                <p class="menu-item">
                    즐겨찾기
                </p>
<!--                <favorite-list :items="favoriteItems" class="favorite-list" @delete="onFavoriteDelete" />-->

                <p-divider class="sidebar-divider" />
                <div v-for="(item) in menuList" :key="item.label"
                     @click="showPage(item.routeName)"
                >
                    <p class="menu-item"
                       :class="{'selected': item.label === selectedItem.label}"
                    >
                        {{ item.label }}
                        <p-i name="ic_arrow_right" width="1rem" height="1rem"
                             color="inherit transparent"
                        />
                    </p>
                    <p-divider class="sidebar-divider" />
                </div>
            </aside>
        </template>
        <template #default>
            <router-view />
        </template>
    </vertical-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import VerticalPageLayout from '@/common/components/layouts/VerticalPageLayout.vue';
import VueI18n from 'vue-i18n';
import { PDivider, PI } from '@spaceone/design-system';
import { FavoriteItem } from '@/store/modules/favorite/type';
import FavoriteList from '@/common/modules/favorite-list/FavoriteList.vue';

import TranslateResult = VueI18n.TranslateResult;

interface MenuItem {
    routeName: string;
    label: TranslateResult;
}

export default {
    name: 'SpotAutomationMainPage',
    components: {
        VerticalPageLayout,
        FavoriteList,
        PDivider,
        PI,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            menuList: computed(() => [
                {
                    routeName: 'spotDashboard',
                    label: vm.$t('AUTOMATION.SPOT_AUTOMATION.MAIN.DASHBOARD'),
                },
                {
                    routeName: 'spotGroup',
                    label: vm.$t('AUTOMATION.SPOT_AUTOMATION.MAIN.SPOT_GROUP'),
                },
            ]) as unknown as MenuItem[],
            selectedItem: {} as MenuItem,
            favoriteItems: computed(() => vm.$store.getters['favorite/spotGroup/sortedItems']),
        });

        const onFavoriteDelete = (item: FavoriteItem) => {
            vm.$store.dispatch('favorite/spotGroup/removeItem', item);
        };

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
            // await vm.$store.dispatch('favorite/spotGroup/load');
        })();

        return {
            ...toRefs(state),
            showPage,
            onFavoriteDelete,
        };
    },
};
</script>

<style lang="postcss" scoped>
.sidebar-menu {
    margin-left: 1rem;
    margin-top: 2rem;
}
.sidebar-divider {
    @apply w-full;
    margin-bottom: 0.75rem;
}
.menu-item {
    @apply text-gray-900 font-bold truncate;
    width: 14.75rem;
    font-size: 0.875rem;
    line-height: 170%;
    margin-bottom: 0.5rem;

    &:hover {
        @apply cursor-pointer;
        text-decoration: underline;
    }
    &:active {
        @apply text-blue-500 cursor-pointer;
    }
    &.selected {
        @apply text-blue-500 cursor-pointer;
    }
}

.vertical-page-layout::v-deep {
    .right-container {
        .page-contents {
            padding: 0;
        }
    }
}
</style>
