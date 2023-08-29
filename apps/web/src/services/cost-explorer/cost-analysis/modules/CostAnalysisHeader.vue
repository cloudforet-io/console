<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PIconButton, PHeading, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { REQUEST_TYPE } from '@/services/cost-explorer/cost-analysis/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';

const CostAnalysisQueryFormModal = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFormModal.vue');
const DeleteModal = () => import('@/common/components/modals/DeleteModal.vue');


const costAnalysisPageStore = useCostAnalysisPageStore();

const state = reactive({
    defaultTitle: computed<TranslateResult>(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COST_ANALYSIS')),
    costQueryMenuItems: computed<MenuItem[]>(() => ([
        { name: 'header', label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVED_QUERY'), type: 'header' },
        { name: undefined, label: 'Cost Analysis', type: 'item' },
        ...costAnalysisPageStore.costQueryList.map((item: CostQuerySetModel): MenuItem => ({
            name: item.cost_query_set_id,
            label: item.name,
            type: 'item',
        })),
    ])),
    title: computed<string>(() => costAnalysisPageStore.selectedQuerySet?.name ?? 'Cost Analysis'),
    itemIdForDeleteQuery: '',
    currency: computed(() => store.state.settings.currency),
    currencySymbol: computed(() => store.getters['settings/currencySymbol']),
    selectedQuerySetId: undefined as string|undefined,
    queryFormModalVisible: false,
    queryDeleteModalVisible: false,
});

/* Utils */
const getQueryWithKey = (queryItemKey: string): Partial<CostQuerySetModel> => (costAnalysisPageStore.costQueryList.find((item) => item.cost_query_set_id === queryItemKey)) || {};

/* Event Handlers */
const handleClickQueryItem = async (queryId: string) => {
    if (queryId === costAnalysisPageStore.selectedQueryId) return;

    if (queryId) {
        const { options } = getQueryWithKey(queryId);
        await costAnalysisPageStore.setQueryOptions(options);
        costAnalysisPageStore.selectQueryId(queryId);
    } else {
        await costAnalysisPageStore.setQueryOptions();
        costAnalysisPageStore.selectQueryId(undefined);
    }
};

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
                <template #title-left-extra>
                    <p-select-dropdown :items="state.costQueryMenuItems"
                                       style-type="icon-button"
                                       button-icon="ic_list-bulleted-3"
                                       class="list-button"
                                       @select="handleClickQueryItem"
                    >
                        <template #menu-item--format="{item}">
                            <div class="query-item-wrapper">
                                <div class="dropdown-item-wrapper">
                                    <span>{{ item.label }}</span><span v-if="!item.name"
                                                                       class="default-item-suffix"
                                    >(default)</span>
                                </div>
                                <div v-if="item.name"
                                     class="button-wrapper"
                                >
                                    <p-icon-button name="ic_delete"
                                                   size="sm"
                                                   @click.stop="handleClickDeleteQuery(item.name)"
                                    />
                                    <p-icon-button name="ic_edit-text"
                                                   size="sm"
                                                   @click.stop="handleClickEditQuery(item.name)"
                                    />
                                </div>
                            </div>
                        </template>
                    </p-select-dropdown>
                </template>
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
    .dropdown-item-wrapper {
        @apply flex items-center gap-1;

        .default-item-suffix {
            @apply text-gray-400;
        }
    }

    /* custom design-system component - p-button-modal */
    :deep(.p-button-modal) {
        display: block;
    }

    /* custom design-system component - p-select-dropdown */
    :deep(.list-button) {
        @apply bg-transparent;
        display: inline-flex;
        .p-context-menu {
            min-width: 22rem;

            .menu-item-wrapper {
                display: flex;
                justify-content: space-between;
            }
        }
    }

    .query-item-wrapper {
        @apply flex justify-between;
        width: 100%;
    }
}
</style>
