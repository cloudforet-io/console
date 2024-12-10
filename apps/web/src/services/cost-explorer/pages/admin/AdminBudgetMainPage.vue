<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PHeading, PDivider, PButton, PHeadingLayout,
} from '@cloudforet/mirinae';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import BudgetMainList from '@/services/cost-explorer/components/BudgetMainList.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const state = reactive({
    hasReadWriteAccess: computed<boolean|undefined>(() => usePageEditableStatus()),
});

const handleCreateBudgetSelect = () => {
    router.push(getProperRouteLocation({ name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME }));
};
</script>

<template>
    <div class="budget-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')" />
            </template>
            <template v-if="state.hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateBudgetSelect"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-divider />
        <budget-main-list />
    </div>
</template>
