<template>
    <p-button-modal class="collector-schedule-modal"
                    :header-title="props.editMode ? $t('INVENTORY.COLLECTOR.MAIN.EDIT_SCHEDULE') : $t('INVENTORY.COLLECTOR.MAIN.SET_SCHEDULE') "
                    size="md"
                    fade
                    backdrop
                    :visible="collectorPageState.visibleScheduleModal"
                    @close="handleCloseModal"
                    @cancel="handleCloseModal"
                    @confirm="handleConfirm"
    >
        <template #body>
            <!-- TODO: changed condition after API spec checking -->
            <collector-schedule-form enable-hours-edit
                                     call-api-on-power-change
            />
        </template>
    </p-button-modal>
</template>

<script setup lang="ts">
import { watch } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n as i18nTranslator } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import type { CollectorModel, CollectorUpdateParameter } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorScheduleForm
    from '@/services/asset-inventory/collector/shared/collector-forms/CollectorScheduleForm.vue';



interface Props {
    editMode: boolean
}

const props = withDefaults(defineProps<Props>(), {
    editMode: false,
});

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

/* Components */
const handleCloseModal = () => {
    collectorPageStore.$patch({
        visibleScheduleModal: false,
    });
};
const handleConfirm = async () => {
    try {
        const collector = await fetchCollectorUpdate();
        await collectorFormStore.setOriginCollector(collector);
        showSuccessMessage(i18nTranslator.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SCHEDULE'), '');
        handleCloseModal();
    } catch (e) {
        collectorFormStore.resetSchedulePower();
        ErrorHandler.handleRequestError(e, i18nTranslator.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SCHEDULE'));
    }
};

/* API */
const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is not defined');
    const schedule = collectorFormState.originCollector?.schedule ?? {};
    const params: CollectorUpdateParameter = {
        collector_id: collectorFormStore.collectorId,
        schedule: {
            ...schedule,
            state: collectorFormState.schedulePower ? 'ENABLED' : 'DISABLED',
        },
    };
    return SpaceConnector.client.inventory.collector.update(params);
};

/* Watcher */
watch(() => collectorPageState.selectedCollect, async (value) => {
    if (collectorPageState.visibleScheduleModal) {
        await collectorFormStore.setOriginCollector(value);
    }
});
</script>
