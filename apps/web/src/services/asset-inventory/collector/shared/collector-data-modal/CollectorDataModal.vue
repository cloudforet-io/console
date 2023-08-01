<template>
    <div class="collector-data-modal">
        <p-button-modal :visible="collectorDataModalState.visible"
                        :header-title="state.headerTitle"
                        :theme-color="state.isDuplicateJobs ? 'alert' : 'primary'"
                        :loading="state.loading"
                        size="sm"
                        @confirm="handleClickConfirm"
                        @cancel="handleClickCancel"
                        @close="handleClickCancel"
        >
            <template #body>
                <div v-if="state.isDuplicateJobs">
                    <collector-data-duplication-inner :name="state.provider.label"
                                                      :icon="state.provider.icon"
                    />
                </div>
                <collector-data-default-inner v-else
                                              :name="state.provider.label"
                                              :icon="state.provider.icon"
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
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';
import CollectorDataDefaultInner
    from '@/services/asset-inventory/collector/shared/collector-data-modal/modules/CollectorDataDefaultInner.vue';
import CollectorDataDuplicationInner
    from '@/services/asset-inventory/collector/shared/collector-data-modal/modules/CollectorDataDuplicationInner.vue';
import { JOB_STATE } from '@/services/asset-inventory/collector/type';

const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});

const state = reactive({
    loading: false,
    headerTitle: computed(() => (state.isDuplicateJobs
        ? i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DUPLICATION_TITLE')
        : i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.TITLE'))),
    isDuplicateJobs: computed(() => {
        const recentJob = collectorDataModalState.recentJob;
        if (!recentJob) return '';
        return recentJob.status === JOB_STATE.IN_PROGRESS;
    }),
    provider: computed(() => {
        const selectedCollector = collectorDataModalState.selectedCollector;
        return storeState.providers[selectedCollector?.provider || ''];
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
        await SpaceConnector.client.inventory.collector.collect({
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
const apiQueryHelper = new ApiQueryHelper();
const fetchSecrets = async (provider: string) => {
    try {
        apiQueryHelper.setFilters([{ k: 'provider', v: provider, o: '=' }]);

        const results = await SpaceConnector.client.secret.secret.list({
            query: apiQueryHelper.data,
        });
        collectorDataModalStore.$patch((_state) => {
            _state.secrets = results.results;
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        collectorDataModalStore.$patch((_state) => {
            _state.secrets = [];
        });
    }
};

watch([() => collectorDataModalState.selectedCollector, () => collectorDataModalState.visible], async ([selectedCollector, visible]) => {
    if (!selectedCollector || !visible) return;
    await fetchSecrets(selectedCollector.provider);
}, { immediate: true });

onMounted(() => {
    store.dispatch('reference/provider/load');
});

onUnmounted(() => {
    collectorDataModalStore.$reset();
    collectorDataModalStore.$dispose();
});
</script>
