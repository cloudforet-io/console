<template>
    <p-button-modal class="collector-schedule-modal"
                    :header-title="state.isViewMode ? $t('INVENTORY.COLLECTOR.MAIN.VIEW_SCHEDULE_MODAL_TITLE') : $t('INVENTORY.COLLECTOR.MAIN.COLLECTOR_SCHEDULE')"
                    size="md"
                    fade
                    backdrop
                    :visible="collectorPageState.scheduleModalVisible"
                    :hide-footer-close-button="state.isViewMode"
                    @close="handleCloseModal"
                    @cancel="handleCloseModal"
                    @confirm="handleConfirm"
    >
        <template #body>
            <collector-schedule-form :readonly="state.isViewMode" />
        </template>
        <template v-if="state.isViewMode"
                  #confirm-button
        >
            {{ $t('APP.MAIN.OK') }}
        </template>
    </p-button-modal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { CollectorUpdateParameters } from '@/api-clients/inventory/collector/schema/api-verbs/update';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n as i18nTranslator } from '@/translations';


import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorScheduleForm
    from '@/services/asset-inventory/components/CollectorFormSchedule.vue';
import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';
import { useCollectorPageStore } from '@/services/asset-inventory/stores/collector-page-store';


const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.state;
const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const { collectorAPI } = useCollectorApi();

const state = reactive({
    isViewMode: computed(() => collectorPageState.scheduleModalMode === 'view'),
});

/* Query */
const queryClient = useQueryClient();
const { key: collectorGetQueryKey } = useServiceQueryKey('inventory', 'collector', 'get', {
    contextKey: computed(() => collectorPageState.selectedCollectorId),
});
const { data: selectedCollectorData } = useCollectorGetQuery({
    collectorId: computed(() => collectorPageState.selectedCollectorId),
});

/* Events */
const closeScheduleModal = () => {
    collectorPageStore.setScheduleModalVisible(false);
};

const handleCloseModal = () => {
    closeScheduleModal();
};
const handleConfirm = async () => {
    if (state.isViewMode) {
        closeScheduleModal();
        return;
    }
    try {
        await fetchCollectorUpdate();
        handleCloseModal();
    } catch (e) {
        collectorFormStore.resetSchedulePower();
        ErrorHandler.handleRequestError(e, i18nTranslator.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SCHEDULE'));
    }
};

/* API */
const fetchCollectorUpdate = async () => {
    if (!collectorFormState.collectorId) throw new Error('collector_id is not defined');
    const params: CollectorUpdateParameters = {
        collector_id: collectorFormState.collectorId,
        schedule: {
            hours: collectorFormState.scheduleHours || [],
            state: collectorFormState.schedulePower ? 'ENABLED' : 'DISABLED',
        },
    };
    await collectorAPI.update(params);
    queryClient.invalidateQueries({ queryKey: collectorGetQueryKey.value });
};

/* Watcher */
watch(() => selectedCollectorData.value, async (value) => {
    if (!value) return;
    await collectorFormStore.setOriginCollector(value);
}, { immediate: true });
</script>
