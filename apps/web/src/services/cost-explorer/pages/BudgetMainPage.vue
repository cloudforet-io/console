<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import {
    PHeading, PDivider, PButton, PHeadingLayout,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { SpaceRouter } from '@/router';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import BudgetListPeriodCustomModal from '@/services/cost-explorer/components/BudgetListPeriodCustomModal.vue';
import BudgetMainList from '@/services/cost-explorer/components/BudgetMainList.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const authorizationStore = useAuthorizationStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    isWorkspaceOwner: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});

const state = reactive({
    modalVisible: false,
    startMonth: '',
    endMonth: '',
});

const modalVisible = ref<boolean>(false);

const handleCreateBudgetSelect = () => {
    SpaceRouter.router.push({ name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME });
};

const handleModalVisible = (visible: boolean) => {
    modalVisible.value = visible;
};

const handleMonthRange = (monthRange: [string, string]) => {
    state.startMonth = monthRange[0];
    state.endMonth = monthRange[1];
};
</script>

<template>
    <div>
        <div class="budget-page">
            <p-heading-layout class="mb-6">
                <template #heading>
                    <p-heading :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')" />
                </template>
                <template v-if="hasReadWriteAccess && storeState.isWorkspaceOwner"
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
            <budget-main-list :modal-visible="modalVisible"
                              @update:select-month-modal-visible="handleModalVisible"
            />
        </div>
        <budget-list-period-custom-modal :visible="modalVisible"
                                         @update:visible="handleModalVisible"
                                         @update:month-range="handleMonthRange"
        />
    </div>
</template>
