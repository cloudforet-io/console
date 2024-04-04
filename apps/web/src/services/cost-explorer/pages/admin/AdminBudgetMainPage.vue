<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import {
    PHeading, PDivider, PButton,
} from '@spaceone/design-system';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import BudgetMainList from '@/services/cost-explorer/components/BudgetMainList.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();
const handleCreateBudgetSelect = () => {
    router.push(getProperRouteLocation({ name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME }));
};
</script>

<template>
    <div class="budget-page">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')">
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateBudgetSelect"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-divider />
        <budget-main-list />
    </div>
</template>
