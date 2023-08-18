<template>
    <p-button-modal class="collector-schedule-modal"
                    :header-title="$t('INVENTORY.COLLECTOR.MAIN.COLLECTOR_SCHEDULE')"
                    size="md"
                    fade
                    backdrop
                    :visible="collectorPageState.visible.scheduleModal"
                    @close="handleCloseModal"
                    @cancel="handleCloseModal"
                    @confirm="handleConfirm"
    >
        <template #body>
            <collector-schedule-form />
        </template>
    </p-button-modal>
</template>

<script setup lang="ts">
import { watch } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { i18n as i18nTranslator } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import type { CollectorModel, CollectorUpdateParameter } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorScheduleForm
    from '@/services/asset-inventory/collector/shared/collector-forms/CollectorScheduleForm.vue';

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;
const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const emit = defineEmits<{(e: 'refresh-collector-list'): void}>();

/* Components */
const handleCloseModal = () => {
    collectorPageStore.$patch((_state) => {
        _state.visible.scheduleModal = false;
    });
};
const handleConfirm = async () => {
    try {
        await fetchCollectorUpdate();
        handleCloseModal();
        emit('refresh-collector-list');
    } catch (e) {
        collectorFormStore.resetSchedulePower();
        ErrorHandler.handleRequestError(e, i18nTranslator.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SCHEDULE'));
    }
};

/* API */
const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is not defined');
    const params: CollectorUpdateParameter = {
        collector_id: collectorFormStore.collectorId,
        schedule: {
            hours: collectorFormState.scheduleHours || [],
            state: collectorFormState.schedulePower ? 'ENABLED' : 'DISABLED',
        },
    };
    return collectorPageStore.updateCollectorSchedule(params);
};

/* Watcher */
watch(() => collectorPageState.selectedCollector, async (value) => {
    await collectorFormStore.setOriginCollector(value);
}, { immediate: true });
</script>
