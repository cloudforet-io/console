<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import {
    PHeading, PDivider, PButton, PHeadingLayout,
} from '@cloudforet/mirinae';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';


import BudgetMainList from '@/services/cost-explorer/components/BudgetMainList.vue';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';

const router = useRouter();

const { hasReadWriteAccess } = usePageEditableStatus();

const handleCreateBudgetSelect = () => {
    router.push({ name: ADMIN_COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME });
};
</script>

<template>
    <div class="budget-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')" />
            </template>
            <template v-if="hasReadWriteAccess"
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
