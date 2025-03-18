<template>
    <p-pane-layout>
        <collector-detail-section-header :title="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE')"
                                         :edit-mode="state.isEditMode"
                                         :hide-edit-button="!props.hasReadWriteAccess || !collectorFormState.schedulePower || !state.isEditableCollector"
                                         @click-edit="handleClickEdit"
        />

        <div class="schedule-wrapper">
            <collector-schedule-form :hours-readonly="!state.isEditMode"
                                     :readonly="!props.hasReadWriteAccess || !state.isEditableCollector"
                                     reset-on-collector-id-change
                                     call-api-on-power-change
            />

            <div class="button-group">
                <p-button v-if="state.isEditMode"
                          style-type="tertiary"
                          size="lg"
                          :disabled="state.updateLoading"
                          @click="handleClickCancel"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.CANCEL') }}
                </p-button>
                <p-button v-if="state.isEditMode"
                          style-type="primary"
                          size="lg"
                          :loading="state.updateLoading"
                          class="save-changes-button"
                          @click="handleClickSave"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
    </p-pane-layout>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PPaneLayout,
} from '@cloudforet/mirinae';


import type { CollectorUpdateParameters } from '@/schema/inventory/collector/api-verbs/update';
import type { CollectorModel } from '@/schema/inventory/collector/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorDetailSectionHeader from '@/services/asset-inventory/components/CollectorDetailSectionHeader.vue';
import CollectorScheduleForm
    from '@/services/asset-inventory/components/CollectorFormSchedule.vue';
import { useCollectorDetailPageStore } from '@/services/asset-inventory/stores/collector-detail-page-store';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/stores/collector-form-store';

const props = defineProps<{
    hasReadWriteAccess?: boolean
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const collectorDetailPageStore = useCollectorDetailPageStore();
const state = reactive({
    isEditMode: false,
    isEditableCollector: computed(() => collectorDetailPageStore.getters.isEditableCollector),
    updateLoading: false,
});

const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormState.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdateParameters = {
        collector_id: collectorFormState.collectorId,
        schedule: {
            state: collectorFormState.schedulePower ? 'ENABLED' : 'DISABLED',
            hours: collectorFormState.scheduleHours,
        },
    };
    return SpaceConnector.clientV2.inventory.collector.update<CollectorUpdateParameters, CollectorModel>(params);
};

const handleClickEdit = () => {
    state.isEditMode = true;
};

const handleClickCancel = () => {
    state.isEditMode = false;
    collectorFormStore.resetSchedule(true);
};

const handleClickSave = async () => {
    try {
        state.updateLoading = true;
        const collector = await fetchCollectorUpdate();
        await collectorFormStore.setOriginCollector(collector);
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SCHEDULE'), '');
        state.isEditMode = false;
    } catch (error) {
        collectorFormStore.resetSchedule();
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SCHEDULE'));
    } finally {
        state.updateLoading = false;
    }
};

watch(() => collectorFormState.schedulePower, (schedulePower) => {
    if (!schedulePower) {
        state.isEditMode = false;
    }
});

</script>

<style lang="postcss" scoped>
.schedule-wrapper {
    padding: 0.5rem 1rem;
    .button-group {
        margin-bottom: 1.5rem;
        .save-changes-button {
            margin-left: 1rem;
        }
    }
}
</style>
