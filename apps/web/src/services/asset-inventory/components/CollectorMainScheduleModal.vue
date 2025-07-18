<template>
    <p-button-modal class="collector-schedule-modal"
                    :header-title="state.isViewMode ? $t('INVENTORY.COLLECTOR.MAIN.VIEW_SCHEDULE_MODAL_TITLE') : $t('INVENTORY.COLLECTOR.MAIN.COLLECTOR_SCHEDULE')"
                    size="md"
                    fade
                    backdrop
                    :visible="collectorMainPageState.scheduleModalVisible"
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
import {
    computed, reactive, watch,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { CollectorUpdateParameters } from '@/api-clients/inventory/collector/schema/api-verbs/update';
import { i18n as i18nTranslator } from '@/translations';


import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorScheduleForm
    from '@/services/asset-inventory/components/CollectorFormSchedule.vue';
import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';
import { useCollectorMainPageStore } from '@/services/asset-inventory/stores/collector-main-page-store';


const collectorMainPageStore = useCollectorMainPageStore();
const collectorMainPageState = collectorMainPageStore.state;
const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const { collectorAPI } = useCollectorApi();

const state = reactive({
    isViewMode: computed(() => collectorMainPageState.scheduleModalMode === 'view'),
});

/* Query */
const queryClient = useQueryClient();
const { data: originCollectorData, isLoading: isOriginCollectorLoading, collectorGetQueryKey } = useCollectorGetQuery({
    collectorId: computed(() => collectorFormState.collectorId),
});

/* Events */
const closeScheduleModal = () => {
    collectorMainPageStore.setScheduleModalVisible(false);
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
        collectorFormStore.resetSchedulePower(originCollectorData.value);
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
watch([() => collectorFormState.collectorId, () => isOriginCollectorLoading.value], async ([collectorId, isLoading]) => {
    if (!collectorId || isLoading) return;
    collectorFormStore.resetSchedule(originCollectorData.value);
    collectorFormStore.resetSchedulePower(originCollectorData.value);
}, { immediate: true });
</script>
