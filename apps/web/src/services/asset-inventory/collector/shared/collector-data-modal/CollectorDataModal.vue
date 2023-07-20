<template>
    <div class="collector-data-modal">
        <p-button-modal :visible="collectorPageState.visible.collectorModal"
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
                    <collector-data-duplication-inner :account-type="collectorDataModalState.accountType"
                                                      :name="state.item.name"
                                                      :plugin="state.item.plugin"
                    />
                </div>
                <collector-data-default-inner v-else
                                              :name="state.item.name"
                                              :plugin="state.item.plugin"
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
import { computed, reactive } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';
import CollectorDataDefaultInner
    from '@/services/asset-inventory/collector/shared/collector-data-modal/modules/CollectorDataDefaultInner.vue';
import CollectorDataDuplicationInner
    from '@/services/asset-inventory/collector/shared/collector-data-modal/modules/CollectorDataDuplicationInner.vue';
import { COLLECT_DATA_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';
import { JOB_STATE } from '@/services/asset-inventory/collector/type';

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;
const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
});

const state = reactive({
    loading: false,
    headerTitle: computed(() => (state.isDuplicateJobs
        ? i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DUPLICATION_TITLE')
        : i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.TITLE'))),
    item: computed(() => {
        const selectedCollector = collectorDataModalState.selectedCollector;
        return {
            ...selectedCollector,
            plugin: {
                name: storeState.plugins[selectedCollector.plugin_info?.plugin_id]?.label,
                icon: storeState.plugins[selectedCollector.plugin_info?.plugin_id]?.icon,
            },
        };
    }),
    collectDataType: computed(() => {
        const selectedSecret = collectorDataModalState.selectedSecret;
        return Object.keys(selectedSecret).length > 0 ? COLLECT_DATA_TYPE.SECRET : COLLECT_DATA_TYPE.COLLECTOR;
    }),
    isDuplicateJobs: computed(() => collectorDataModalState.recentJob.status === JOB_STATE.IN_PROGRESS),
});

const emit = defineEmits<{(e: 'click-confirm'): void}>();

/* Components */
const handleClickCancel = () => {
    collectorPageStore.$patch((_state) => {
        _state.visible.collectorModal = false;
    });
    emit('click-confirm');
};
const handleClickConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.client.inventory.collector.collect({
            collector_id: collectorDataModalState.selectedCollector.collector_id,
            secret_id: collectorDataModalState.selectedSecret.secret_id,
        });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_COLLECT_EXECUTION'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_COLLECT_EXECUTION'));
        throw e;
    } finally {
        state.loading = false;
        handleClickCancel();
    }
};
</script>
