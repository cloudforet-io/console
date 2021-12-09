<template>
    <div class="budget-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')">
            <template #extra>
                <p-select-dropdown
                    class="create-budget-box"
                    use-fixed-menu-style
                    :items="createButtonItemList"
                    :placeholder="$t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE_BUDGET')"
                    type="outline-button"
                    @select="handleCreateBudgetSelect"
                />
            </template>
        </p-page-title>
        <p-divider />
        <budget-list :filters="filters" @update:filters="handleUpdateFilters" />
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle, PSelectDropdown, PDivider,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import BudgetList from '@/services/billing/cost-management/budget/modules/budget-list/BudgetList.vue';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';

export default {
    name: 'BudgetPage',
    components: {
        BudgetList,
        PBreadcrumbs,
        PPageTitle,
        PSelectDropdown,
        PDivider,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const queryHelper = new QueryHelper();

        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), path: '/billing' },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), path: '/billing/cost-management' },
                { name: i18n.t('MENU.BILLING.BUDGET') },
            ]),
        });

        const state = reactive({
            createButtonItemList: [
                {
                    label: 'Single Budget',
                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.CREATE._NAME,
                },
            ],
            filters: queryHelper.setFiltersAsRawQueryString(vm.$route.query.filters).filters,
        });

        const handleCreateBudgetSelect = (name) => {
            SpaceRouter.router.push({ name });
        };

        const handleUpdateFilters = (filters: QueryStoreFilter[]) => {
            state.filters = filters;
            SpaceRouter.router.replace({
                query: {
                    filters: queryHelper.setFilters(filters).rawQueryStrings,
                },
            });
        };

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('resource/serviceAccount/load'),
                store.dispatch('resource/project/load'),
                store.dispatch('resource/projectGroup/load'),
                store.dispatch('resource/region/load'),
                store.dispatch('resource/provider/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            routeState,
            handleCreateBudgetSelect,
            handleUpdateFilters,
        };
    },
};
</script>
<style scoped lang="postcss">
.budget-page {
    .create-budget-box {
        width: 9rem;
    }
}
.p-select-dropdown::v-deep {
    .placeholder {
        @apply font-bold;
    }
}
</style>
