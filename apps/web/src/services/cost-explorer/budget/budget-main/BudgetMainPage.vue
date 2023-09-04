<script setup lang="ts">
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import {
    PHeading, PDivider, PButton,
} from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import BudgetList from '@/services/cost-explorer/budget/budget-main/modules/budget-list/BudgetList.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const currentRoute = route;

const queryHelper = new QueryHelper();

const state = reactive({
    createButtonItemList: computed(() => [
        {
            label: t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.SINGLE_BUDGET'),
            name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME,
        },
    ]),
    filters: queryHelper.setFiltersAsRawQueryString(currentRoute.query?.filters ?? []).filters,
    hasManagePermission: useManagePermissionState(),
});

const handleCreateBudgetSelect = (name) => {
    router.push({ name });
};

const handleUpdateFilters = (filters: ConsoleFilter[]) => {
    state.filters = filters;
    router.replace({
        query: {
            filters: queryHelper.setFilters(filters).rawQueryStrings,
        },
    });
};

</script>

<template>
    <div class="budget-page">
        <p-heading :title="t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')">
            <template #extra>
                <!--                <p-select-dropdown-->
                <!--                    class="create-budget-box"-->
                <!--                    use-fixed-menu-style-->
                <!--                    :items="createButtonItemList"-->
                <!--                    :placeholder="t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE_BUDGET')"-->
                <!--                    type="outline-button"-->
                <!--                    @select="handleCreateBudgetSelect"-->
                <!--                />-->
                <p-button style-type="secondary"
                          icon-left="ic_plus_bold"
                          :disabled="!state.hasManagePermission"
                          @click="handleCreateBudgetSelect(state.createButtonItemList[0].name)"
                >
                    {{ t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-divider />
        <budget-list :filters="state.filters"
                     @update:filters="handleUpdateFilters"
        />
    </div>
</template>

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
