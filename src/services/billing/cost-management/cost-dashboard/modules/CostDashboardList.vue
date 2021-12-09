<template>
    <ul class="dashboard-list">
        <li v-for="(item) in dashboardList" :key="item.dashboard_id"
            class="menu-item"
            :class="{'selected': item.dashboard_id === dashboardIdFromRoute}"
            @click="showPage(item.routeName, item.dashboard_id)"
        >
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
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import {
    PI, PSelectDropdown,
} from '@spaceone/design-system';
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
        PI,
        PSelectDropdown,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
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

        const showHomeDashboardPage = () => {
            if (vm.$route.name === BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME && !state.dashboardIdFromRoute) {
                SpaceRouter.router.replace({
                    name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME,
                    params: { dashboardId: state.homeDashboardId },
                }).catch(() => {});
            }
        };

        const initHomeDashboard = () => {
            if (!state.homeDashboardId) {
                store.dispatch('settings/setItem', {
                    key: 'homeDashboard',
                    value: state.items[0]?.dashboard_id,
                    path: '/costDashboard',
                });
            }
            state.dashboardIdFromRoute = state.items[0]?.dashboard_id;
        };

        (async () => {
            await listDashboard();
            if (!state.homeDashboardId) initHomeDashboard();
            showHomeDashboardPage();
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
