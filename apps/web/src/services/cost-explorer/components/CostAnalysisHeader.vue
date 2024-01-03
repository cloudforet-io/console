<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PIconButton, PHeading, PLazyImg, PDivider, PI,
} from '@spaceone/design-system';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import type { CostQuerySetDeleteParameters } from '@/schema/cost-analysis/cost-query-set/api-verbs/delete';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';

import { getCompoundKeyWithManagedCostQuerySetFavoriteKey } from '@/lib/helper/config-data-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { gray } from '@/styles/colors';

import {
    DYNAMIC_COST_QUERY_SET_PARAMS,
} from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';

const CostAnalysisQueryFormModal = () => import('@/services/cost-explorer/components/CostAnalysisQueryFormModal.vue');
const DeleteModal = () => import('@/common/components/modals/DeleteModal.vue');


const { getProperRouteLocation } = useProperRouteLocation();
const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    defaultTitle: computed<TranslateResult>(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COST_ANALYSIS')),
    title: computed<string>(() => costAnalysisPageGetters.selectedQuerySet?.name ?? state.defaultTitle),
    dataSourceImage: computed(() => costAnalysisPageGetters.dataSourceImageUrl),
    managedCostQuerySetList: computed(() => costAnalysisPageGetters.managedCostQuerySetList),
    isManagedCostQuerySet: computed<boolean>(() => (costAnalysisPageGetters.selectedQueryId
        ? state.managedCostQuerySetList.some((item) => item.cost_query_set_id === costAnalysisPageGetters.selectedQueryId)
        : false)),
    itemIdForDeleteQuery: '',
    selectedQuerySetId: undefined as string|undefined,
    queryFormModalVisible: false,
    queryDeleteModalVisible: false,
    isEditableQuerySet: computed<boolean>(() => costAnalysisPageGetters.selectedQueryId !== DYNAMIC_COST_QUERY_SET_PARAMS),
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
        await SpaceConnector.clientV2.costAnalysis.costQuerySet.delete<CostQuerySetDeleteParameters>({ cost_query_set_id: state.itemIdForDeleteQuery });
        await costAnalysisPageStore.getCostQueryList();
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_DELETE_QUERY'), '');
        await SpaceRouter.router.push(getProperRouteLocation({
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
            params: {
                dataSourceId: costAnalysisPageGetters.selectedDataSourceId as string,
                costQuerySetId: costAnalysisPageGetters.managedCostQuerySetList[0].cost_query_set_id,
            },
        }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_DELETE_QUERY'));
    }
};
</script>

<template>
    <div class="cost-analysis-header">
        <section class="title-section">
            <p-heading :title="state.title">
                <template #title-left-extra>
                    <div class="title-left-extra">
                        <p-lazy-img :src="state.dataSourceImage"
                                    width="2rem"
                                    height="2rem"
                        />
                        <p-i v-if="state.managedCostQuerySetList.some((item) => item.name === (state.title || ''))"
                             name="ic_main-filled"
                             width="1rem"
                             height="1rem"
                             :color="gray[500]"
                        />
                    </div>
                </template>
                <template #title-right-extra>
                    <div v-if="costAnalysisPageGetters.selectedQueryId"
                         class="title-right-extra icon-wrapper"
                    >
                        <div class="favorite-button-wrapper">
                            <favorite-button :item-id="getCompoundKeyWithManagedCostQuerySetFavoriteKey(costAnalysisPageGetters.selectedDataSourceId,costAnalysisPageGetters.selectedQueryId)"
                                             :favorite-type="FAVORITE_TYPE.COST_ANALYSIS"
                                             scale="0.8"
                            />
                        </div>
                        <template v-if="state.hasManagePermission && state.isEditableQuerySet && !state.isManagedCostQuerySet">
                            <p-icon-button name="ic_edit-text"
                                           size="md"
                                           @click.stop="handleClickEditQuery(costAnalysisPageGetters.selectedQueryId)"
                            />
                            <p-icon-button name="ic_delete"
                                           size="md"
                                           @click.stop="handleClickDeleteQuery(costAnalysisPageGetters.selectedQueryId)"
                            />
                        </template>
                    </div>
                    <div class="title-right-extra currency-wrapper">
                        <span class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CURRENCY') }}:</span>
                        <span>{{ CURRENCY_SYMBOL[costAnalysisPageGetters.currency] }}{{ costAnalysisPageGetters.currency }}</span>
                    </div>
                </template>
            </p-heading>
        </section>
        <p-divider class="heading-divider" />
        <cost-analysis-query-form-modal :visible.sync="state.queryFormModalVisible"
                                        :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.EDIT_COST_ANALYSIS')"
                                        request-type="EDIT"
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
