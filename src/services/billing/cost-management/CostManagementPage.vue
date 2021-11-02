<template>
    <vertical-page-layout class="cost-management-page">
        <template #sidebar>
            <aside class="sidebar-menu">
                <p class="sidebar-title">
                    {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.FAVORITES') }} <span class="count">({{ favoriteItems.length }})</span>
                </p>
                <p-divider class="sidebar-divider" />
                <!--                <favorite-list :items="favoriteItems" class="favorite-list" @delete="onFavoriteDelete">-->
                <!--                    <template #icon="{item}">-->
                <!--                        <p-i name="ic_private" class="private-icon"-->
                <!--                             width="1rem" height="1rem"-->
                <!--                        />-->
                <!--                    </template>-->
                <!--                </favorite-list>-->
                <p class="sidebar-title">
                    {{ $t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD') }}
                    <p-icon-button name="ic_plus" class="add-button"
                                   style-type="transparent" size="sm"
                    />
                </p>
                <p-divider class="sidebar-divider" />
                <ul class="dashboard-list">
                    <li v-for="(item) in dashboardList" :key="item.label"
                        class="menu-item"
                        @click="showPage(item.routeName, item.id)"
                    >
                        <p-i v-if="item.private" name="ic_private" class="private-icon"
                             width="1rem"
                             height="1rem"
                        />
                        <p-i name="ic_bookmark" width="0.625rem" height="0.625rem"
                             class="favorite-icon"
                        />
                        <span class="title">
                            {{ item.label }}
                        </span>
                        <p-i v-if="item.home" name="ic_home" class="home-icon"
                             width="1rem" height="1rem"
                        />
                        <p-select-dropdown class="more-button"
                                           :items="moreMenuItems"
                                           button-style-type="transparent"
                                           use-fixed-menu-style
                                           menu-position="right"
                                           type="icon-button"
                                           button-icon="ic_more"
                        />
                    </li>
                </ul>
                <div v-for="(item) in menuList" :key="item.label"
                     @click="showPage(item.routeName)"
                >
                    <sidebar-title :title="item.label"
                                   style-type="link"
                    />
                </div>
            </aside>
        </template>
        <template #default>
            <router-view />
        </template>
    </vertical-page-layout>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';


import {
    PDivider, PI, PSelectDropdown, PIconButton,
} from '@spaceone/design-system';

import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';

import { i18n } from '@/translations';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { FavoriteItem } from '@/store/modules/favorite/type';

interface MenuItem {
    routeName?: string;
    label?: TranslateResult;
}

const tempDashboardData = [
    {
        id: 'dashboard-0',
        title: 'test1',
        private: true,
        home: true,
        favorite: false,
    },
    {
        id: 'dashboard-1',
        title: 'test2',
        private: false,
        home: false,
        favorite: true,
    },
    {
        id: 'dashboard-3',
        title: 'test3',
        private: true,
        home: false,
        favorite: true,
    },
];

export default {
    name: 'CostManagementPage',
    components: {
        VerticalPageLayout,
        SidebarTitle,
        PDivider,
        PI,
        PSelectDropdown,
        PIconButton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            menuList: computed<MenuItem[]>(() => [
                {
                    routeName: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.COST_ANALYSIS'),
                },
                {
                    routeName: BILLING_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                    label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.BUDGET'),
                },
            ]),
            dashboardList: tempDashboardData.map(d => ({
                ...d,
                label: d.title,
                routeName: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME,
            })),
            selectedItem: {} as MenuItem,
            favoriteItems: computed(() => [
                { name: 'a' },
                { name: 'b' },
            ]),
            moreMenuItems: computed(() => [
                { name: 'duplicate', label: 'Duplicate' },
                { name: 'set as home', label: 'Set as Home', disabled: true },
            ]),
        });

        /* util */
        const showPage = (routeName, routeParam) => {
            if (routeParam) {
                vm.$router.replace({
                    name: routeName,
                    params: { id: routeParam },
                }).catch(() => {});
            } else {
                vm.$router.replace({ name: routeName }).catch(() => {});
            }
        };

        const onFavoriteDelete = (item: FavoriteItem) => {
        };

        return {
            ...toRefs(state),
            showPage,
            onFavoriteDelete,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-management-page {
    .sidebar-title {
        @apply text-gray-900 text-sm font-bold;
        position: relative;
        align-items: center;
        padding: 2rem 0 0.75rem 1rem;
        .count {
            font-weight: normal;
        }
    }
    .sidebar-divider {
        @apply w-full;
        padding-left: 0;
        margin-bottom: 0.75rem;
    }
    .dashboard-list {
        margin: 0 0.75rem 1.5rem;
    }
    .menu-item {
        @apply rounded text-gray-900;
        display: flex;
        position: relative;
        align-items: center;
        width: 100%;
        height: 2rem;
        padding: 0.375rem 0.125rem;
        font-size: 0.875rem;
        line-height: 140%;
        &:hover {
            @apply bg-blue-100 cursor-pointer;
        }
        &:active {
            @apply bg-blue-200 text-blue-500 cursor-pointer;
        }
        &.selected {
            @apply bg-blue-200 text-blue-500 cursor-pointer;
        }
        .title {
            @apply truncate;
        }
        .home-icon {
            flex-shrink: 0;
            margin-left: 0.125rem;
        }
        .favorite-icon {
            flex-shrink: 0;
            margin-right: 0.125rem;
        }
        .private-icon {
            flex-shrink: 0;
            margin-right: 0.125rem;
        }
        .more-button::v-deep {
            display: none;
            flex-shrink: 0;
            margin-left: auto;
            background-color: transparent;
            button:hover {
                background-color: transparent;
            }
        }
        &:hover .more-button::v-deep {
            display: inline-block;
        }
    }
    .add-button {
        position: absolute;
        bottom: 0.5rem;
        right: 0.75rem;
    }
}
</style>
