<template>
    <div class="collector-data-modal">
        <p-button-modal :visible="collectorDataModalState.visible && !collectorDataModalState.initLoading"
                        :header-title="state.headerTitle"
                        :theme-color="state.isDuplicateJobs ? 'alert' : 'primary'"
                        :loading="state.loading"
                        :disabled="!state.secretsCount"
                        size="sm"
                        @confirm="handleClickConfirm"
                        @cancel="handleClickCancel"
                        @close="handleClickCancel"
        >
            <template #body>
                <div v-if="state.isDuplicateJobs">
                    <collector-data-duplication-inner :name="state.accountName"
                                                      :icon="state.provider?.icon"
                    />
                </div>
                <collector-data-default-inner v-else
                                              :name="state.accountName"
                                              :icon="state.provider?.icon"
                                              :secrets-count="state.secretsCount"
                />
            </template>
            <template #confirm-button>
                <span v-if="state.isDuplicateJobs">{{ $t('INVENTORY.COLLECTOR.MAIN.RESTART') }}</span>
                <span v-else>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.CONFIRM_BUTTON') }}</span>
            </template>
        </p-button-modal>
    </div>
</template>

<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PButtonModal } from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CollectorCollectParameters } from '@/schema/inventory/collector/api-verbs/collect';
import type { JobModel } from '@/schema/inventory/job/model';
import type { SecretListParameters } from '@/schema/secret/secret/api-verbs/list';
import type { SecretModel } from '@/schema/secret/secret/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorDataDefaultInner
    from '@/services/asset-inventory/components/CollectorDataDefaultInner.vue';
import CollectorDataDuplicationInner
    from '@/services/asset-inventory/components/CollectorDataDuplicationInner.vue';
import { COLLECT_DATA_TYPE, JOB_STATE } from '@/services/asset-inventory/constants/collector-constant';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/stores/collector-data-modal-store';

const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
});

const state = reactive({
    loading: false,
    secretsCount: 0,
    headerTitle: computed(() => (state.isDuplicateJobs
        ? i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DUPLICATION_TITLE')
        : i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.TITLE'))),
    isDuplicateJobs: computed<boolean | undefined>(() => {
        const recentJob = collectorDataModalState.recentJob;
        const selectedSecret = collectorDataModalState.selectedSecret;
        if (!recentJob) return undefined;
        if (selectedSecret) {
            return recentJob.secret_id === selectedSecret.secret_id && recentJob.status === JOB_STATE.IN_PROGRESS;
        }
        return recentJob.status === JOB_STATE.IN_PROGRESS;
    }),
    serviceAccountReferenceMap: computed(() => allReferenceStore.getters.serviceAccount),
    provider: computed(() => {
        const selectedCollector = collectorDataModalState.selectedCollector;
        return selectedCollector?.provider ? storeState.providers[selectedCollector.provider] : undefined;
    }),
    accountName: computed(() => {
        const collectDataType = collectorDataModalState.collectDataType;
        if (collectDataType === COLLECT_DATA_TYPE.ENTIRE) {
            return state.provider?.label;
        }

        const selectedSecret = collectorDataModalState.selectedSecret;
        if (!selectedSecret) return '';
        const id = selectedSecret.service_account_id;
        return state.serviceAccountReferenceMap[id].name ?? id;
    }),
    secretFilter: computed(() => collectorDataModalState.selectedCollector?.secret_filter),
    isExcludeFilter: computed(() => !!(state.secretFilter.exclude_service_accounts ?? []).length),
    serviceAccountsFilter: computed<string[]>(() => {
        if (!state.secretFilter) return [];
        if (state.secretFilter.state === 'DISABLED') return [];
        return (state.isExcludeFilter) ? (state.secretFilter.exclude_service_accounts ?? []) : (state.secretFilter.service_accounts ?? []);
    }),
});

const emit = defineEmits<{(e: 'click-confirm'): void}>();

/* Components */
const handleClickCancel = () => {
    collectorDataModalStore.$patch({ visible: false });
    emit('click-confirm');
};
const handleClickConfirm = async () => {
    if (!collectorDataModalState.selectedCollector) throw new Error('[CollectorDataModal] selectedCollector is null');

    state.loading = true;
    try {
        await SpaceConnector.clientV2.inventory.collector.collect<CollectorCollectParameters, JobModel>({
            collector_id: collectorDataModalState.selectedCollector.collector_id,
            secret_id: collectorDataModalState.selectedSecret?.secret_id,
        });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_COLLECT_EXECUTION'), '');
        emit('click-confirm');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_COLLECT_EXECUTION'));
        throw e;
    } finally {
        state.loading = false;
        collectorDataModalStore.$patch({ visible: false });
    }
};

/* API */
const apiQueryHelper = new ApiQueryHelper().setCountOnly();
const fetchSecrets = async (provider: string, serviceAccounts: string[]) => {
    apiQueryHelper.setFilters([{ k: 'provider', v: provider, o: '=' }]);

    if (serviceAccounts.length > 0) {
        if (state.isExcludeFilter) apiQueryHelper.addFilter({ k: 'service_account_id', v: serviceAccounts, o: '!=' });
        else apiQueryHelper.addFilter({ k: 'service_account_id', v: serviceAccounts, o: '=' });
    }
    try {
        const { total_count } = await SpaceConnector.clientV2.secret.secret.list<SecretListParameters, ListResponse<SecretModel>>({
            query: apiQueryHelper.data,
        });
        state.secretsCount = total_count;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.secretsCount = 0;
    }
};

watch([() => collectorDataModalState.selectedCollector, () => collectorDataModalState.visible], async ([selectedCollector, visible]) => {
    if (!selectedCollector || !visible) {
        collectorDataModalStore.$reset();
        return;
    }
    await fetchSecrets(selectedCollector.provider, state.serviceAccountsFilter);
    await collectorDataModalStore.getJobs(selectedCollector.collector_id);
}, { immediate: true });

onUnmounted(() => {
    collectorDataModalStore.$dispose();
});
</script>
