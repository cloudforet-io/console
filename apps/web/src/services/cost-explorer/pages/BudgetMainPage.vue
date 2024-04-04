<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PHeading, PDivider, PButton,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import BudgetMainList from '@/services/cost-explorer/components/BudgetMainList.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});

const handleCreateBudgetSelect = () => {
    SpaceRouter.router.push({ name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME });
};
</script>

<template>
    <div class="budget-page">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')">
            <template v-if="storeState.isWorkspaceOwner"
                      #extra
            >
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
