<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PHeading, PHeadingLayout, PSelectDropdown,
} from '@cloudforet/mirinae';

import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';


import BudgetDetailDeleteModal from '@/services/cost-explorer/components/BudgetDetailDeleteModal.vue';
import BudgetNameEditModal from '@/services/cost-explorer/components/BudgetNameEditModal.vue';
import { useBudgetGetQuery } from '@/services/cost-explorer/composables/use-budget-get-query';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


interface Props {
    budgetId: string;
}
const props = withDefaults(defineProps<Props>(), {
    budgetId: '',
});

const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const authorizationStore = useAuthorizationStore();
const { hasReadWriteAccess } = usePageEditableStatus();

const router = useRouter();
const { budgetData, isFetching } = useBudgetGetQuery(computed(() => props.budgetId));

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceOwner: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    dataSourceMap: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    actionDropdownList: [
        { name: 'rename', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.RENAME'), icon: 'ic_edit-text' },
        { name: 'delete', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.DELETE'), icon: 'ic_delete' },
    ],
    selectedAction: '',
    budgetData: computed<BudgetModel>(() => budgetData.value),
    isProjectTarget: computed(() => state.budgetData?.resource_group === 'PROJECT'),
    dataSourceName: computed(() => {
        if (!state.budgetData) return '';
        return storeState.dataSourceMap[state.budgetData.data_source_id]?.label;
    }),
    deleteModalVisible: false,
    nameEditModalVisible: false,
});

watch(() => state, () => {
    if (state.selectedAction === 'delete') {
        state.deleteModalVisible = true;
    } else if (state.selectedAction === 'rename') {
        state.nameEditModalVisible = true;
    }
}, { deep: true, immediate: true });

/* Event */
const handleUpdateNameEditModalVisible = async () => {
    state.selectedAction = '';
    state.nameEditModalVisible = false;
};

const handleUpdateDelete = () => {
    state.selectedAction = '';
    state.deleteModalVisible = false;
};
const handleConfirmDelete = () => {
    router.push({ name: storeState.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.BUDGET._NAME : COST_EXPLORER_ROUTE.BUDGET._NAME }).catch(() => {});
};
const handleClickBackButton = () => {
    router.push({ name: storeState.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.BUDGET._NAME : COST_EXPLORER_ROUTE.BUDGET._NAME }).catch(() => {});
};
</script>

<template>
    <div class="budget-detail-heading">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :show-back-button="!isFetching"
                           :title="state.budgetData?.name"
                           @click-back-button="handleClickBackButton"
                >
                    <template v-if="!isFetching"
                              #title-right-extra
                    >
                        <p-select-dropdown v-if="hasReadWriteAccess && (state.isProjectTarget && storeState.isWorkspaceOwner) && !storeState.isAdminMode"
                                           style-type="tertiary-icon-button"
                                           button-icon="ic_ellipsis-horizontal"
                                           size="sm"
                                           :menu="state.actionDropdownList"
                                           :selected.sync="state.selectedAction"
                        >
                            <template #menu-item--format="{item}">
                                <div class="flex items-center">
                                    <span>{{ item.label }}</span>
                                </div>
                            </template>
                        </p-select-dropdown>
                        <!-- <p-icon-button v-if="hasReadWriteAccess && (storeState.isAdminMode || (state.isProjectTarget && storeState.isWorkspaceOwner))"
                                       name="ic_delete"
                                       @click="handleClickDelete"
                        /> -->
                    </template>
                </p-heading>
            </template>
            <!-- <template #extra>
                <div class="right-info-box">
                    <div class="right-item">
                        <span class="label">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DATA_SOURCE') }}:</span>
                        <span>{{ state.dataSourceName }}</span>
                    </div>
                    <p-divider vertical
                               class="divider"
                    />
                    <div class="right-item">
                        <span class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DETAIL.ORIGINAL_CURRENCY') }}:</span>
                        <span>{{ CURRENCY_SYMBOL[state.budgetData?.currency] }}{{ state.budgetData?.currency }}</span>
                    </div>
                </div>
            </template> -->
        </p-heading-layout>
        <budget-detail-delete-modal v-if="!isFetching"
                                    :visible="state.deleteModalVisible"
                                    :budget-name="state.budgetData?.name"
                                    :budget-id="state.budgetData?.budget_id"
                                    @update:visible="handleUpdateDelete"
                                    @confirm="handleConfirmDelete"
        />
        <budget-name-edit-modal :visible="state.nameEditModalVisible"
                                :budget-name="state.budgetData?.name"
                                :budget-id="state.budgetData?.budget_id"
                                @update:visible="handleUpdateNameEditModalVisible"
        />
    </div>
</template>

<style lang="postcss" scoped>
.budget-detail-heading {
    .right-info-box {
        @apply flex items-center justify-end;
        height: 2rem;
        .divider {
            height: 0.875rem;
            margin: 0 0.5rem;
        }

        .right-item {
            @apply inline-flex items-center text-gray-800;
            font-size: 0.875rem;
            .label {
                font-weight: 700;
                padding-right: 0.25rem;
            }
        }
    }
}
</style>
