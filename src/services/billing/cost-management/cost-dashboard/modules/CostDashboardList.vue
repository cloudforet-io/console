<template>
    <ul class="dashboard-list">
        <li v-for="(item) in dashboardList" :key="item.public_dashboard_id"
            class="menu-item"
            :class="{'selected': item.public_dashboard_id === dashboardIdFromRoute}"
        >
            <router-link
                :to="{
                    name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME,
                    params: {
                        dashboardId: item.public_dashboard_id
                    }
                }"
                class="link inline-block"
            >
                <span class="title">
                    {{ item.name }}
                </span>
                <p-i v-if="item.scope === 'PUBLIC'" name="ic_public" class="public-icon"
                     width="0.875rem"
                     height="0.875rem"
                />
                <p-i v-if="item.public_dashboard_id === homeDashboardId" name="ic_home" class="home-icon"
                     width="0.875rem" height="0.875rem"
                />
            </router-link>
            <p-select-dropdown :selected="selectedMoreMenuItem"
                               class="more-button"
                               :items="moreMenuItems"
                               button-style-type="transparent"
                               use-fixed-menu-style
                               menu-position="right"
                               type="icon-button"
                               button-icon="ic_more"
                               @select="handleSelectMoreMenu(item, ...arguments)"
            />
        </li>
    </ul>
</template>

<script lang="ts">
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
import { i18n } from '@/translations';
import ErrorHandler from '@/common/composables/error/errorHandler';


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
            }))),
            moreMenuItems: computed(() => [
                { name: 'duplicate', label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.DUPLICATE'), disabled: true },
                { name: 'setHome', label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.SET_HOME') },
            ]),
            selectedMoreMenuItem: '',
            dashboardIdFromRoute: computed<string|undefined>(() => vm.$route.params.dashboardId),
            homeDashboardId: computed(() => store.getters['settings/getItem']('homeDashboard', '/costDashboard')),
        });

        /* util */
        const handleSelectMoreMenu = (item, selectedMoreMenuItem) => {
            state.selectedMoreMenuItem = selectedMoreMenuItem;
            if (state.selectedMoreMenuItem === 'setHome') {
                store.dispatch('settings/setItem', {
                    key: 'homeDashboard',
                    value: item.public_dashboard_id,
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
            SpaceRouter.router.replace({
                name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME,
                params: { dashboardId: state.homeDashboardId },
            });
        };

        const initHomeDashboard = () => {
            if (!state.homeDashboardId) {
                store.dispatch('settings/setItem', {
                    key: 'homeDashboard',
                    value: state.items[0]?.public_dashboard_id,
                    path: '/costDashboard',
                });
            }
        };

        (async () => {
            await listDashboard();

            if (!state.homeDashboardId) initHomeDashboard();

            const isDashboardIdFromRouteValid = !!state.items.find(d => d.public_dashboard_id === state.dashboardIdFromRoute);

            if (vm.$route.name === BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME
                && (!state.dashboardIdFromRoute || !isDashboardIdFromRouteValid)) {
                showHomeDashboardPage();
            }
        })();

        return {
            ...toRefs(state),
            handleSelectMoreMenu,
            BILLING_ROUTE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-list {
    padding: 0 0.75rem 1.25rem;
}
.menu-item {
    @apply rounded text-gray-900;
    display: flex;
    position: relative;
    align-items: center;
    width: 100%;
    height: 2rem;
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
        @apply truncate inline-block;
        margin-right: 0.25rem;
        padding-bottom: 0.5rem;
        padding-left: 0.75rem;
        padding-top: 0.4rem;
        max-width: calc(100% - 3rem);
    }
    .link {
        display: inline-block;
        width: 100%;
        height: 2rem;
        .home-icon {
            display: inline-block;
            flex-shrink: 0;
            margin-left: 0.125rem;
            margin-top: -1.5rem;
        }
        .favorite-icon {
            flex-shrink: 0;
            margin-right: 0.125rem;
        }
        .public-icon {
            flex-shrink: 0;
            margin-right: 0.125rem;
            margin-top: -1.5rem;
        }
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
