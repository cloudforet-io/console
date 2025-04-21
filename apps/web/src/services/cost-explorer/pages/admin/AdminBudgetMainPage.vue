<script setup lang="ts">
import {
    PHeading, PDivider, PHeadingLayout,
} from '@cloudforet/mirinae';

import BudgetMainList from '@/services/cost-explorer/components/BudgetMainList.vue';
</script>

<template>
    <div class="budget-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')" />
            </template>
            <!-- <template v-if="hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateBudgetSelect"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE') }}
                </p-button>
            </template> -->
        </p-heading-layout>
        <p-divider />
        <budget-main-list />
    </div>
</template>
