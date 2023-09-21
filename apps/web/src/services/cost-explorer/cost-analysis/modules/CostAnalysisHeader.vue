<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PIconButton, PHeading, PLazyImg, PDivider, PI,
} from '@spaceone/design-system';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { gray } from '@/styles/colors';

import {
    DYNAMIC_COST_QUERY_SET_PARAMS, managedCostQuerySetIdList,
} from '@/services/cost-explorer/cost-analysis/config';
import { REQUEST_TYPE } from '@/services/cost-explorer/cost-analysis/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';

const CostAnalysisQueryFormModal = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFormModal.vue');
const DeleteModal = () => import('@/common/components/modals/DeleteModal.vue');


const costAnalysisPageStore = useCostAnalysisPageStore();

const state = reactive({
    defaultTitle: computed<TranslateResult>(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COST_ANALYSIS')),
    title: computed<string>(() => costAnalysisPageStore.selectedQuerySet?.name ?? 'Cost Analysis'),
    dataSourceImage: computed(() => costAnalysisPageStore.dataSourceImageUrl),
    isManagedCostQuerySet: computed<boolean>(() => (costAnalysisPageStore.selectedQueryId ? managedCostQuerySetIdList.includes(costAnalysisPageStore.selectedQueryId) : false)),
    itemIdForDeleteQuery: '',
    selectedQuerySetId: undefined as string|undefined,
    queryFormModalVisible: false,
    queryDeleteModalVisible: false,
    isEditableQuerySet: computed<boolean>(() => costAnalysisPageStore.selectedQueryId !== DYNAMIC_COST_QUERY_SET_PARAMS),
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
                <template #title-left-extra>
                    <div class="title-left-extra">
                        <p-lazy-img :src="state.dataSourceImage"
                                    width="2rem"
                                    height="2rem"
                        />
                        <p-i v-if="managedCostQuerySetIdList.includes(state.title || '')"
                             name="ic_main-filled"
                             width="1rem"
                             height="1rem"
                             :color="gray[500]"
                        />
                    </div>
                </template>
                <template #title-right-extra>
                    <div v-if="costAnalysisPageStore.selectedQueryId"
                         class="title-right-extra icon-wrapper"
                    >
                        <div class="favorite-button-wrapper">
                            <favorite-button :item-id="costAnalysisPageStore.selectedQueryId"
                                             :favorite-type="FAVORITE_TYPE.COST_ANALYSIS"
                                             scale="0.8"
                            />
                        </div>
                        <template v-if="state.isEditableQuerySet && !state.isManagedCostQuerySet">
                            <p-icon-button name="ic_edit-text"
                                           size="md"
                                           @click.stop="handleClickEditQuery(costAnalysisPageStore.selectedQueryId)"
                            />
                            <p-icon-button name="ic_delete"
                                           size="md"
                                           @click.stop="handleClickDeleteQuery(costAnalysisPageStore.selectedQueryId)"
                            />
                        </template>
                    </div>
                    <div class="title-right-extra currency-wrapper">
                        <span class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CURRENCY') }}:</span>
                        <span>{{ CURRENCY_SYMBOL[costAnalysisPageStore.currency] }}{{ costAnalysisPageStore.currency }}</span>
                    </div>
                </template>
            </p-heading>
        </section>
        <p-divider class="heading-divider" />
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
    .heading-divider {
        margin-top: -0.375rem;
    }
    .title-section {
        @apply relative;
        display: flex;
    }

    .title-left-extra {
        @apply inline-flex items-center;
        margin-bottom: -0.25rem;
        margin-right: 0.5rem;
        gap: 0.5rem;
    }

    .title-right-extra {
        @apply flex-shrink-0 inline-flex items-center;
        margin-bottom: -0.25rem;
        &.icon-wrapper {
            gap: 0.5rem;
            .favorite-button-wrapper {
                @apply flex items-center justify-center;
                width: 1.25rem;
                height: 1.25rem;
            }
        }
        &.currency-wrapper {
            @apply justify-end text-gray-800;
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
