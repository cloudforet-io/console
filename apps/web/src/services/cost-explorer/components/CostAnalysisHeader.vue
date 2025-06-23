<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PIconButton, PHeading, PLazyImg, PDivider, PI, PHeadingLayout, PScopedNotification,
} from '@cloudforet/mirinae';

import { useCostQuerySetApi } from '@/api-clients/cost-analysis/cost-query-set/composables/use-cost-query-set-api';
import type { CostQuerySetDeleteParameters } from '@/api-clients/cost-analysis/cost-query-set/schema/api-verbs/delete';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';

import { getCompoundKeyWithManagedCostQuerySetFavoriteKey } from '@/lib/helper/config-data-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { gray } from '@/styles/colors';

import { useCostQuerySetQuery } from '@/services/cost-explorer/composables/queries/use-cost-query-set-query';
import {
    DYNAMIC_COST_QUERY_SET_PARAMS,
} from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';

const CostAnalysisQueryFormModal = () => import('@/services/cost-explorer/components/CostAnalysisQueryFormModal.vue');
const DeleteModal = () => import('@/common/components/modals/DeleteModal.vue');

const gnbStore = useGnbStore();
const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.state;
const costQuerySetGetters = costQuerySetStore.getters;
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const router = useRouter();

/* Query */
const {
    refetch: refreshCostQuerySets, selectedQuerySet, managedCostQuerySets,
} = useCostQuerySetQuery({
    data_source_id: computed(() => costQuerySetGetters.dataSourceId),
    isUnifiedCostOn: computed(() => costQuerySetState.isUnifiedCostOn),
    selectedQuerySetId: computed(() => costQuerySetState.selectedQuerySetId),
});
const queryClient = useQueryClient();
const { costQuerySetAPI } = useCostQuerySetApi();

// Service Query Key for invalidation - target specific data source
const { key: costQuerySetListKey } = useServiceQueryKey('cost-analysis', 'cost-query-set', 'list', {
    params: computed(() => ({
        data_source_id: costQuerySetGetters.dataSourceId,
    })),
});

const storeState = reactive({
    isUnifiedCost: computed(() => costQuerySetState.isUnifiedCostOn),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    defaultTitle: computed<TranslateResult>(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COST_ANALYSIS')),
    title: computed<string>(() => selectedQuerySet.value?.name ?? state.defaultTitle),
    dataSourceImage: computed(() => costAnalysisPageGetters.dataSourceImageUrl),
    isManagedCostQuerySet: computed<boolean>(() => (costQuerySetState.selectedQuerySetId
        ? managedCostQuerySets.value?.some((item) => item.cost_query_set_id === costQuerySetState.selectedQuerySetId)
        : false)),
    itemIdForDeleteQuery: '',
    selectedQuerySetId: undefined as string|undefined,
    queryFormModalVisible: false,
    queryDeleteModalVisible: false,
    isEditableQuerySet: computed<boolean>(() => (hasReadWriteAccess.value || false) && costQuerySetState.selectedQuerySetId !== DYNAMIC_COST_QUERY_SET_PARAMS),
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.COST_ANALYSIS,
        id: state.isManagedCostQuerySet
            ? getCompoundKeyWithManagedCostQuerySetFavoriteKey(costQuerySetState.selectedDataSourceId || '', costQuerySetState.selectedQuerySetId || '')
            : costQuerySetState.selectedQuerySetId || '',
    })),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
});

/* Mutation */
const { mutate: deleteCostQuerySet } = useMutation({
    mutationFn: (params: CostQuerySetDeleteParameters) => costQuerySetAPI.delete(params),
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: costQuerySetListKey.value });
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_DELETE_QUERY'), '');

        await router.push({
            name: storeState.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME : COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
            params: {
                dataSourceId: costQuerySetState.selectedDataSourceId as string,
                costQuerySetId: managedCostQuerySets.value?.[0]?.cost_query_set_id || '',
            },
        }).catch(() => {});

        const isFavoriteItem = favoriteGetters.costAnalysisItems.find((item) => item.itemId === state.itemIdForDeleteQuery);
        if (isFavoriteItem) {
            await favoriteStore.deleteFavorite({
                itemType: FAVORITE_TYPE.COST_ANALYSIS,
                workspaceId: state.currentWorkspaceId || '',
                itemId: state.itemIdForDeleteQuery,
            });
        }
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_DELETE_QUERY'));
    },
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
    refreshCostQuerySets();
};

const handleDeleteQueryConfirm = async () => {
    state.queryDeleteModalVisible = false;
    deleteCostQuerySet({ cost_query_set_id: state.itemIdForDeleteQuery });
};

const handleRouteToUnifiedCostSettings = () => {
    router.push({
        name: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS._NAME,
    }).catch(() => {});
};

watch(() => state.favoriteOptions, async (favoriteOptions) => {
    await gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });
</script>

<template>
    <div class="cost-analysis-header">
        <p-heading-layout class="title-section">
            <template #heading>
                <p-heading :title="state.title">
                    <template #title-left-extra>
                        <div class="title-left-extra">
                            <p-lazy-img v-if="state.dataSourceImage"
                                        :src="state.dataSourceImage"
                                        width="2rem"
                                        height="2rem"
                            />
                            <p-i v-else
                                 name="ic_unified-cost"
                                 width="2rem"
                                 height="2rem"
                            />
                            <p-i v-if="managedCostQuerySets?.some((item) => item.name === (state.title || ''))"
                                 name="ic_main-filled"
                                 width="1rem"
                                 height="1rem"
                                 :color="gray[500]"
                            />
                        </div>
                    </template>
                    <template v-if="costQuerySetState.selectedQuerySetId && state.isEditableQuerySet && !state.isManagedCostQuerySet"
                              #title-right-extra
                    >
                        <p-icon-button name="ic_edit-text"
                                       size="md"
                                       @click.stop="handleClickEditQuery(costQuerySetState.selectedQuerySetId)"
                        />
                        <p-icon-button name="ic_delete"
                                       size="md"
                                       @click.stop="handleClickDeleteQuery(costQuerySetState.selectedQuerySetId)"
                        />
                    </template>
                </p-heading>
            </template>
            <template #extra>
                <div class="currency-wrapper">
                    <span class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CURRENCY') }}:</span>
                    <span>{{ CURRENCY_SYMBOL[costAnalysisPageGetters.currency] }}{{ costAnalysisPageGetters.currency }}</span>
                    <p-icon-button v-if="storeState.isUnifiedCost && storeState.isAdminMode"
                                   class="currency-setting-button"
                                   name="ic_settings"
                                   size="sm"
                                   style-type="tertiary"
                                   shape="square"
                                   @click.stop="handleRouteToUnifiedCostSettings"
                    />
                </div>
            </template>
        </p-heading-layout>
        <p-scoped-notification v-if="storeState.isUnifiedCost"
                               class="mb-6"
                               type="information"
                               icon="ic_info-circle"
                               layout="in-section"
        >
            {{ storeState.isAdminMode ? $t('COST_EXPLORER.COST_ANALYSIS.UNIFIED_COST_ADMIN_DESC') : $t('COST_EXPLORER.COST_ANALYSIS.UNIFIED_COST_DESC') }}
        </p-scoped-notification>
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
        margin-bottom: 1.5rem;
    }

    .title-left-extra {
        @apply inline-flex items-center;
        gap: 0.5rem;
    }

    .currency-wrapper {
        @apply justify-end text-gray-800 flex items-center;
        font-size: 0.875rem;
        flex-shrink: 0;
        line-height: 2rem;
        .label {
            font-weight: 700;
            padding-right: 0.25rem;
        }

        .currency-setting-button {
            margin-left: 0.25rem;
        }
    }

    /* custom design-system component - p-button-modal */
    :deep(.p-button-modal) {
        display: block;
    }
}
</style>
