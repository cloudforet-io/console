<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PIconButton, PHeading,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { REQUEST_TYPE } from '@/services/cost-explorer/cost-analysis/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';

const CostAnalysisQueryFormModal = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFormModal.vue');
const DeleteModal = () => import('@/common/components/modals/DeleteModal.vue');


const costAnalysisPageStore = useCostAnalysisPageStore();

const state = reactive({
    defaultTitle: computed<TranslateResult>(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COST_ANALYSIS')),
    title: computed<string>(() => costAnalysisPageStore.selectedQuerySet?.name ?? 'Cost Analysis'),
    itemIdForDeleteQuery: '',
    currency: computed(() => store.state.settings.currency),
    currencySymbol: computed(() => store.getters['settings/currencySymbol']),
    selectedQuerySetId: undefined as string|undefined,
    queryFormModalVisible: false,
    queryDeleteModalVisible: false,
});

/* Event Handlers */
const handleClickDeleteQuery = (id: string) => {
    state.itemIdForDeleteQuery = id;
    state.queryDeleteModalVisible = true;
};

const handleClickEditQuery = (id: string) => {
    state.selectedQuerySetId = id;
    state.queryFormModalVisible = true;
};

const handleUpdateQuery = () => {
    costAnalysisPageStore.getCostQueryList();
};

const handleDeleteQueryConfirm = async () => {
    state.queryDeleteModalVisible = false;
    try {
        await SpaceConnector.client.costAnalysis.costQuerySet.delete({ cost_query_set_id: state.itemIdForDeleteQuery });
        await costAnalysisPageStore.getCostQueryList();
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_DELETE_QUERY'), '');
        if (costAnalysisPageStore.selectedQueryId === state.itemIdForDeleteQuery) {
            await SpaceRouter.router.push({ name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME });
            await costAnalysisPageStore.setQueryOptions();
            costAnalysisPageStore.selectQueryId(undefined);
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_DELETE_QUERY'));
    }
};
</script>

<template>
    <div class="cost-analysis-header">
        <section class="title-section">
            <p-heading :title="costAnalysisPageStore.selectedQueryId ? state.title : state.defaultTitle">
                <template #title-right-extra>
                    <div v-if="costAnalysisPageStore.selectedQueryId"
                         class="title-right-extra"
                    >
                        <p-icon-button name="ic_delete"
                                       @click.stop="handleClickDeleteQuery(costAnalysisPageStore.selectedQueryId)"
                        />
                        <p-icon-button name="ic_edit-text"
                                       @click.stop="handleClickEditQuery(costAnalysisPageStore.selectedQueryId)"
                        />
                    </div>
                    <div class="title-right-extra currency-wrapper">
                        <span class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CURRENCY') }}:</span>
                        <span>{{ state.currencySymbol }}{{ state.currency }}</span>
                    </div>
                </template>
            </p-heading>
        </section>
        <cost-analysis-query-form-modal :visible.sync="state.queryFormModalVisible"
                                        :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.EDIT_COST_ANALYSIS')"
                                        :request-type="REQUEST_TYPE.EDIT"
                                        :selected-query-set-id="state.selectedQuerySetId"
                                        @update-query="handleUpdateQuery"
        />
        <delete-modal :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CHECK_DELETE_MODAL_DESC')"
                      :visible.sync="state.queryDeleteModalVisible"
                      @confirm="handleDeleteQueryConfirm"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-header {
    .title-section {
        @apply relative;
        display: flex;
    }

    .title-right-extra {
        @apply flex-shrink-0 inline-flex items-center;
        &.currency-wrapper {
            @apply justify-end;
            font-size: 0.875rem;
            float: right;
            .label {
                font-weight: 700;
                padding-right: 0.25rem;
            }
        }
    }

    /* custom design-system component - p-button-modal */
    :deep(.p-button-modal) {
        display: block;
    }
}
</style>
