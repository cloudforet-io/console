<template>
    <aside class="sidebar-menu">
        <p class="sidebar-title">
            {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.FAVORITES') }}
        </p>
        <p-divider class="sidebar-divider" />
        <p class="sidebar-title">
            {{ $t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD') }}
            <!--            <p-icon-button name="ic_plus" class="add-button"-->
            <!--                           style-type="transparent" size="sm"-->
            <!--            />-->
        </p>
        <p-divider class="sidebar-divider" />
        <ul class="dashboard-list">
            <li v-for="(item) in dashboardList" :key="item.dashboard_id"
                class="menu-item"
                :class="{'selected': item.dashboard_id === dashboardIdFromRoute}"
                @click="showPage(item.routeName, item.dashboard_id)"
            >
                <!--                <p-i name="ic_bookmark" width="0.625rem" height="0.625rem"-->
                <!--                     class="favorite-icon"-->
                <!--                />-->
                <span class="title">
                    {{ item.name }}
                </span>
                <p-i v-if="item.scope === 'PRIVATE'" name="ic_private" class="private-icon"
                     width="1rem"
                     height="1rem"
                />
                <p-i v-if="item.dashboard_id === homeDashboardId" name="ic_home" class="home-icon"
                     width="1rem" height="1rem"
                />
                <p-select-dropdown v-model="selectedMoreMenuItem"
                                   class="more-button"
                                   :items="moreMenuItems"
                                   button-style-type="transparent"
                                   use-fixed-menu-style
                                   menu-position="right"
                                   type="icon-button"
                                   button-icon="ic_more"
                                   @select="handleSelectMoreMenu(item)"
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

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import {
    PDivider, PI, PSelectDropdown,
} from '@spaceone/design-system';
import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import { i18n } from '@/translations';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { SpaceRouter } from '@/router';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { DashboardItem } from '@/services/billing/cost-management/cost-dashboard/type';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';

interface ListItem {
    routeName?: string;
    label?: TranslateResult;
}

export default {
    name: 'CostDashboardList',
    components: {
        SidebarTitle,
        PDivider,
        PI,
        PSelectDropdown,
        // PIconButton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            menuList: computed<ListItem[]>(() => [
                {
                    routeName: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.COST_ANALYSIS'),
                },
                {
                    routeName: BILLING_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                    label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.BUDGET'),
                },
            ]),
            items: [] as any,
            dashboardList: computed<DashboardItem[]>(() => state.items.map(d => ({
                ...d,
                label: d.name,
                routeName: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME,
            }))),
            moreMenuItems: computed(() => [
                { name: 'duplicate', label: 'Duplicate', disabled: true },
                { name: 'setHome', label: 'Set as Home' },
            ]),
            selectedMoreMenuItem: '',
            dashboardIdFromRoute: computed(() => vm.$route.params.dashboardId),
            homeDashboardId: computed(() => store.getters['settings/getItem']('homeDashboard', '/costDashboard')),
        });

        /* util */
        const showPage = (routeName, routeParam) => {
            if (routeParam) {
                SpaceRouter.router.replace({
                    name: routeName,
                    params: { dashboardId: routeParam },
                }).catch(() => {});
            } else {
                SpaceRouter.router.replace({ name: routeName }).catch(() => {});
            }
        };

        const handleSelectMoreMenu = (item) => {
            if (state.selectedMoreMenuItem === 'setHome') {
                store.dispatch('settings/setItem', {
                    key: 'homeDashboard',
                    value: item.dashboard_id,
                    path: '/costDashboard',
                });
            }
        };

        const listDashboard = async () => {
            try {
                const { results } = await SpaceConnector.client.costAnalysis.dashboard.list();
                state.items = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
            }
        };

        (() => {
            listDashboard();
        })();


        return {
            ...toRefs(state),
            showPage,
            handleSelectMoreMenu,
        };
    },
};
</script>

<style lang="postcss" scoped>
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

</style>
