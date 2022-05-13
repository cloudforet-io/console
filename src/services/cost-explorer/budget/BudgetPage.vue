<template>
    <div class="budget-page">
        <p-page-title :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')">
            <template #extra>
                <!--                <p-select-dropdown-->
                <!--                    class="create-budget-box"-->
                <!--                    use-fixed-menu-style-->
                <!--                    :items="createButtonItemList"-->
                <!--                    :placeholder="$t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE_BUDGET')"-->
                <!--                    type="outline-button"-->
                <!--                    @select="handleCreateBudgetSelect"-->
                <!--                />-->
                <p-button :outline="true" style-type="primary-dark"
                          icon="ic_plus_bold"
                          :disabled="hasNoManagePermission"
                          @click="handleCreateBudgetSelect(createButtonItemList[0].name)"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE') }}
                </p-button>
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
    PPageTitle, PDivider, PButton,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import BudgetList from '@/services/cost-explorer/budget/modules/budget-list/BudgetList.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { SpaceRouter } from '@/router';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { store } from '@/store';

export default {
    name: 'BudgetPage',
    components: {
        BudgetList,
        PPageTitle,
        // PSelectDropdown,
        PDivider,
        PButton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const queryHelper = new QueryHelper();

        const state = reactive({
            createButtonItemList: computed(() => [
                {
                    label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.SINGLE_BUDGET'),
                    name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME,
                },
                // {
                //     label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BULK_BUDGET'),
                //     name: COST_EXPLORER_ROUTE.BUDGET.BULK_CREATE._NAME,
                // },
            ]),
            filters: queryHelper.setFiltersAsRawQueryString(vm.$route.query.filters).filters,
            hasNoManagePermission: computed<boolean>(() => store.getters['user/hasNoManagePermission']),
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

        return {
            ...toRefs(state),
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
