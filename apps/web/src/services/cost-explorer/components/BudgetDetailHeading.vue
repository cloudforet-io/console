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
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';

interface Props {
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    loading: false,
});

const appContextStore = useAppContextStore();
const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const allReferenceStore = useAllReferenceStore();
const authorizationStore = useAuthorizationStore();
const { hasReadWriteAccess } = usePageEditableStatus();

const router = useRouter();

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
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
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
const handleUpdateNameEditModalVisible = () => {
    state.selectedAction = '';
    state.nameEditModalVisible = false;
    budgetPageStore.getBudgetData(state.budgetData?.budget_id ?? '');
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
                <p-heading :show-back-button="!props.loading"
                           :title="state.budgetData?.name"
                           @click-back-button="handleClickBackButton"
                >
                    <template v-if="!props.loading"
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
                                    <p-i :name="item.icon" />
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
        <budget-detail-delete-modal v-if="!props.loading"
                                    :visible="state.deleteModalVisible"
                                    @update:visible="handleUpdateDelete"
                                    @confirm="handleConfirmDelete"
        />
        <budget-name-edit-modal :visible="state.nameEditModalVisible"
                                :budget-name="state.budgetData?.name"
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
