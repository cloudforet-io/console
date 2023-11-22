<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PHeading, PIconButton, PDivider } from '@spaceone/design-system';


import type { BudgetModel } from '@/schema/cost-analysis/budget/model';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import { useCostDataSourceReferenceStore } from '@/store/reference/cost-data-source-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import BudgetDetailDeleteModal from '@/services/cost-explorer/components/BudgetDetailDeleteModal.vue';
import BudgetDetailInfo from '@/services/cost-explorer/components/BudgetDetailInfo.vue';
import BudgetDetailNotifications
    from '@/services/cost-explorer/components/BudgetDetailNotifications.vue';
import BudgetDetailSummary
    from '@/services/cost-explorer/components/BudgetDetailSummary.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-config';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';



interface Props {
    budgetId: string;
}
const props = withDefaults(defineProps<Props>(), {
    budgetId: '',
});

const router = useRouter();

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const costDataSourceReferenceStore = useCostDataSourceReferenceStore();

const state = reactive({
    loading: true,
    hasManagePermission: useManagePermissionState(),
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
    dataSourceMap: computed(() => costDataSourceReferenceStore.getters.costDataSourceItems),
    dataSourceName: computed(() => state.dataSourceMap[state.budgetData?.data_source_id]?.label),
});

const checkDeleteState = reactive({
    visible: false,
});

const handleClickDelete = () => {
    checkDeleteState.visible = true;
};

const handleUpdateDelete = (visible) => {
    checkDeleteState.visible = visible;
};

const handleConfirmDelete = () => {
    router.push({ name: COST_EXPLORER_ROUTE.BUDGET._NAME });
};

(async () => {
    state.loading = true;
    try {
        await Promise.allSettled([
            budgetPageStore.getBudgetData(props.budgetId),
            budgetPageStore.getBudgetUsageData(props.budgetId),
        ]);
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
})();

</script>

<template>
    <div>
        <section class="page-title-wrapper">
            <p-heading :show-back-button="!state.loading"
                       :title="state.loading ? '' : state.budgetData?.name"
                       @click-back-button="$router.go(-1)"
            >
                <template v-if="!state.loading"
                          #title-right-extra
                >
                    <div class="title-button-group">
                        <p-icon-button name="ic_delete"
                                       :disabled="!state.hasManagePermission"
                                       @click="handleClickDelete"
                        />
                    </div>
                    <div class="title-right-extra">
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
                </template>
            </p-heading>
        </section>
        <section class="content">
            <budget-detail-info class="summary" />
            <budget-detail-summary
                :budget-loading="state.loading"
                class="summary"
            />
            <budget-detail-notifications class="alert"
                                         :manage-disabled="!state.hasManagePermission"
                                         :currency="state.budgetData?.currency"
            />
            <!--            <budget-billing-admin class="budget" />-->
        </section>
        <budget-detail-delete-modal v-if="!state.loading"
                                    :visible="checkDeleteState.visible"
                                    @update="handleUpdateDelete"
                                    @confirm="handleConfirmDelete"
        />
    </div>
</template>


<style lang="postcss" scoped>
.page-title-wrapper {
    .title-right-extra {
        @apply inline-flex items-center justify-end;
        flex-grow: 1;
        line-height: 1.09375rem;
        float: right;
        min-height: 2.5rem;
        .divider {
            height: 0.875rem;
            margin: 0 0.5rem;
        }

        .right-item {
            @apply text-gray-800;
            font-size: 0.875rem;
            .label {
                font-weight: 700;
                padding-right: 0.25rem;
            }
        }
    }
}
.content {
    @apply flex flex-col;
    gap: 1rem;
    .summary {
        flex-grow: 1;
    }
    .alert {
        flex-grow: 1;
    }
}
.title-button-group {
    display: inline-flex;
}
</style>
