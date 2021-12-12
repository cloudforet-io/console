<template>
    <aside class="sidebar-menu">
        <sidebar-title :title="$t('INVENTORY.CLOUD_SERVICE.MAIN.FAVORITES')" />
        <sidebar-title :title="$t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD')" />
        <cost-dashboard-list />
        <div v-for="(item) in menuList" :key="item.label"
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
import { BILLING_ROUTE } from '@/services/billing/routes';
import { SpaceRouter } from '@/router';
import CostDashboardList from '@/services/billing/cost-management/cost-dashboard/modules/CostDashboardList.vue';

interface ListItem {
    routeName?: string;
    label?: TranslateResult;
}

export default {
    name: 'CostManagementMenu',
    components: {
        CostDashboardList,
        SidebarTitle,
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
            currentRouteName: computed(() => vm.$route.name),
        });

        /* util */
        const showPage = (routeName) => {
            if (routeName !== state.currentRouteName) {
                SpaceRouter.router.push({
                    name: routeName,
                });
            }
        };

        return {
            ...toRefs(state),
            showPage,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-list {
    margin: 0 0.75rem 1.5rem;
}
</style>
