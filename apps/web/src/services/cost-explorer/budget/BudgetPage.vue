<template>
    <div class="budget-page">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')">
            <template #extra>
                <!--                <p-select-dropdown-->
                <!--                    class="create-budget-box"-->
                <!--                    use-fixed-menu-style-->
                <!--                    :items="createButtonItemList"-->
                <!--                    :placeholder="$t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE_BUDGET')"-->
                <!--                    type="outline-button"-->
                <!--                    @select="handleCreateBudgetSelect"-->
                <!--                />-->
                <p-button style-type="secondary"
                          icon-left="ic_plus_bold"
                          :disabled="!hasManagePermission"
                          @click="handleCreateBudgetSelect(createButtonItemList[0].name)"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-divider />
        <budget-list :filters="filters"
                     @update:filters="handleUpdateFilters"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PHeading, PDivider, PButton,
} from '@spaceone/design-system';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import BudgetList from '@/services/cost-explorer/budget/modules/budget-list/BudgetList.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';

export default {
    name: 'BudgetPage',
    components: {
        BudgetList,
        PHeading,
        PDivider,
        PButton,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;

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
            hasManagePermission: useManagePermissionState(),
        });

        const handleCreateBudgetSelect = (name) => {
            SpaceRouter.router.push({ name });
        };

        const handleUpdateFilters = (filters: ConsoleFilter[]) => {
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

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .placeholder {
        @apply font-bold;
    }
}
</style>
