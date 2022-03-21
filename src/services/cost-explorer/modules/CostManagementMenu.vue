<template>
    <aside class="sidebar-menu">
        <!--        <sidebar-title :title="$t('INVENTORY.CLOUD_SERVICE.MAIN.FAVORITES')" />-->
        <div>
            <sidebar-title :title="$t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD')" class="sidebar-title">
                <template #extra>
                    <p-icon-text-button style-type="gray-border" size="sm"
                                        name="ic_plus_bold"
                                        @click="handleClickCreate"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.MAIN.CREATE') }}
                    </p-icon-text-button>
                </template>
            </sidebar-title>
            <template v-if="publicDashboardList.length > 0">
                <div v-if="!loading" class="dashboard-list">
                    <p class="dashboard-type">
                        {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.PUBLIC') }}
                    </p>
                    <ul>
                        <cost-dashboard-list :public-dashboard-items="publicDashboardList" />
                    </ul>
                </div>
            </template>
            <template v-if="userDashboardList.length > 0">
                <details v-if="!loading" class="dashboard-list" open>
                    <summary class="dashboard-type">
                        {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.MY_DASHBOARD') }}
                    </summary>
                    <cost-dashboard-list :user-dashboard-items="userDashboardList" :is-public="false" />
                </details>
            </template>
        </div>
        <div v-for="(item) in menuList" :key="item.label"
             class="link-wrapper"
             @click="showPage(item.routeName)"
        >
            <sidebar-title :title="item.label"
                           style-type="link"
                           :selected="currentRouteName === item.routeName"
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
import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import { i18n } from '@/translations';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { SpaceRouter } from '@/router';
import CostDashboardList from '@/services/cost-explorer/modules/CostDashboardList.vue';
import { PIconTextButton } from '@spaceone/design-system';
import {
    DashboardMenuItem,
} from '@/services/cost-explorer/cost-dashboard/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';
import { registerServiceStore } from '@/common/composables/register-service-store';
import { CostDashboardState } from '@/services/cost-explorer/cost-dashboard/store/type';
import CostDashboardStoreModule from '@/services/cost-explorer/cost-dashboard/store';

interface ListItem {
    routeName?: string;
    label?: TranslateResult;
}

export default {
    name: 'CostManagementMenu',
    components: {
        CostDashboardList,
        SidebarTitle,
        PIconTextButton,
    },
    setup() {
        registerServiceStore<CostDashboardState>('costDashboard', CostDashboardStoreModule);
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            menuList: computed<ListItem[]>(() => [
                {
                    routeName: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.COST_ANALYSIS'),
                },
                {
                    routeName: COST_EXPLORER_ROUTE.BUDGET._NAME,
                    label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.BUDGET'),
                },
            ]),
            currentRouteName: computed(() => vm.$route.name),
            publicDashboardList: computed<DashboardMenuItem[]>(() => store.state.service.costDashboard.publicDashboardList ?? []),
            userDashboardList: computed<DashboardMenuItem[]>(() => store.state.service.costDashboard.userDashboardList ?? []),
            loading: true,
        });

        const listDashboard = async () => {
            try {
                state.loading = true;
                await store.dispatch('service/costDashboard/setDashboardList');
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };


        /* util */
        const showPage = (routeName) => {
            if (routeName !== state.currentRouteName) {
                SpaceRouter.router.push({
                    name: routeName,
                });
            }
        };

        const handleClickCreate = () => {
            SpaceRouter.router.push({
                name: COST_EXPLORER_ROUTE.DASHBOARD.CREATE._NAME,
            });
        };

        (async () => {
            await listDashboard();
        })();


        return {
            ...toRefs(state),
            showPage,
            handleClickCreate,
        };
    },
};
</script>

<style lang="postcss" scoped>
.sidebar-title {
    @apply flex justify-between;
    padding-top: 1.5rem;
    padding-right: 1rem;
}
.link-wrapper {
    margin-top: 1.5rem;
}
.dashboard-list {
    padding: 0 0.875rem;
    font-size: 0.875rem;
    & + .dashboard-list {
        @apply mt-3;
    }
    .dashboard-type {
        line-height: 2rem;
    }
}
details {
    summary {
        @apply cursor-pointer;
        display: list-item;
    }
}
</style>
