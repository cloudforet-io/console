<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PButtonModal } from '@cloudforet/mirinae';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { JobModel } from '@/api-clients/inventory/job/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorDataModalDefaultInner
    from '@/services/asset-inventory/components/CollectorDataModalDefaultInner.vue';
import CollectorDataModalDuplicationInner
    from '@/services/asset-inventory/components/CollectorDataModalDuplicationInner.vue';
import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { useInventoryJobListQuery } from '@/services/asset-inventory/composables/use-inventory-job-list-query';
import { useSecretListQuery } from '@/services/asset-inventory/composables/use-secret-list-query';
import { COLLECT_DATA_TYPE, JOB_STATE } from '@/services/asset-inventory/constants/collector-constant';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/stores/collector-data-modal-store';


const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.state;

const referenceMap = useAllReferenceDataModel();

const { collectorAPI } = useCollectorApi();

const state = reactive({
    secretsCount: 0,
    headerTitle: computed(() => (state.isDuplicateJobs
        ? i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DUPLICATION_TITLE')
        : i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.TITLE'))),
    isDuplicateJobs: computed<boolean | undefined>(() => {
        const selectedSecret = collectorDataModalState.selectedSecret;
        if (!recentJob.value) return undefined;
        if (selectedSecret) {
            return recentJob.value.secret_id === selectedSecret.secret_id && recentJob.value.status === JOB_STATE.IN_PROGRESS;
        }
        return recentJob.value.status === JOB_STATE.IN_PROGRESS;
    }),
    provider: computed(() => (selectedCollectorData.value?.provider ? referenceMap.provider[selectedCollectorData.value.provider] : undefined)),
    accountName: computed(() => {
        const collectDataType = collectorDataModalState.collectDataType;
        if (collectDataType === COLLECT_DATA_TYPE.ENTIRE) {
            return state.provider?.label;
        }

        const selectedSecret = collectorDataModalState.selectedSecret;
        if (!selectedSecret) return '';
        const id = selectedSecret.service_account_id;
        return referenceMap.serviceAccount[id]?.name || id;
    }),
    secretFilter: computed(() => selectedCollectorData.value?.secret_filter),
    isExcludeFilter: computed(() => !!(state.secretFilter.exclude_service_accounts ?? []).length),
    serviceAccountsFilter: computed<string[]>(() => {
        if (!state.secretFilter) return [];
        if (state.secretFilter.state === 'DISABLED') return [];
        return (state.isExcludeFilter) ? (state.secretFilter.exclude_service_accounts ?? []) : (state.secretFilter.service_accounts ?? []);
    }),
});
const recentJob = computed<JobModel | undefined>(() => {
    if (collectorDataModalState.selectedSecret) {
        const filteredJobs = jobListData.value?.results?.filter((job) => job.secret_id);
        return filteredJobs?.[0];
    }
    const filteredJobs = jobListData.value?.results?.filter((job) => !job.secret_id);
    return filteredJobs?.[0];
});

/* Query */
const queryClient = useQueryClient();
const { data: selectedCollectorData } = useCollectorGetQuery({
    collectorId: computed(() => collectorDataModalState.selectedCollectorId),
});
const { data: jobListData, isLoading: isJobListLoading } = useInventoryJobListQuery({
    params: computed(() => ({
        collector_id: selectedCollectorData.value?.collector_id,
    })),
});
const apiQueryHelper = new ApiQueryHelper().setCountOnly();
const { data: secretListData } = useSecretListQuery(computed(() => {
    apiQueryHelper.setFilters([{ k: 'provider', v: selectedCollectorData.value?.provider ?? '', o: '=' }]);

    if (state.serviceAccountsFilter.length > 0) {
        if (state.isExcludeFilter) apiQueryHelper.addFilter({ k: 'service_account_id', v: state.serviceAccountsFilter, o: '!=' });
        else apiQueryHelper.addFilter({ k: 'service_account_id', v: state.serviceAccountsFilter, o: '=' });
    }

    return {
        query: apiQueryHelper.data,
    };
}));

/* Mutation */
const { key: jobListQueryKey } = useServiceQueryKey('inventory', 'job', 'list');
const { mutate: collectData, isPending: isCollecting } = useMutation({
    mutationFn: collectorAPI.collect,
    onSuccess: () => {
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_COLLECT_EXECUTION'), '');
        queryClient.invalidateQueries({ queryKey: jobListQueryKey.value });
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_COLLECT_EXECUTION'));
    },
    onSettled: () => {
        collectorDataModalStore.setVisible(false);
    },
});

/* Components */
const handleClickCancel = () => {
    collectorDataModalStore.setVisible(false);
};
const handleClickConfirm = async () => {
    if (!selectedCollectorData.value) throw new Error('[CollectorDataModal] selectedCollector is null');

    collectData({
        collector_id: selectedCollectorData.value.collector_id,
        secret_id: collectorDataModalState.selectedSecret?.secret_id,
    });
};


watch([() => selectedCollectorData.value, () => collectorDataModalState.visible], async ([, visible]) => {
    if (!visible) {
        collectorDataModalStore.reset();
    }
}, { immediate: true });

onUnmounted(() => {
    collectorDataModalStore.reset();
});
</script>

<template>
    <div class="collector-data-modal">
        <p-button-modal :visible="collectorDataModalState.visible && !isJobListLoading"
                        :header-title="state.headerTitle"
                        :theme-color="state.isDuplicateJobs ? 'alert' : 'primary'"
                        :loading="isCollecting"
                        :disabled="!secretListData?.total_count"
                        size="sm"
                        @confirm="handleClickConfirm"
                        @cancel="handleClickCancel"
                        @close="handleClickCancel"
        >
            <template #body>
                <div v-if="state.isDuplicateJobs">
                    <collector-data-modal-duplication-inner
                        :name="state.accountName"
                        :icon="state.provider?.icon"
                    />
                </div>
                <collector-data-modal-default-inner
                    v-else
                    :name="state.accountName"
                    :icon="state.provider?.icon"
                    :secrets-count="secretListData?.total_count ?? 0"
                />
            </template>
            <template #confirm-button>
                <span v-if="state.isDuplicateJobs">{{ $t('INVENTORY.COLLECTOR.MAIN.RESTART') }}</span>
                <span v-else>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.CONFIRM_BUTTON') }}</span>
            </template>
        </p-button-modal>
    </div>
</template>
