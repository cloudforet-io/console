<template>
    <p-pane-layout>
        <section-header :title="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE')"
                        :edit-mode="state.isEditMode || !collectorFormState.schedulePower"
                        :total-count="state.totalCount"
                        @click-edit="handleClickEdit"
        />

        <div class="schedule-wrapper">
            <collector-schedule-form :hours-readonly="!state.isEditMode"
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
import { reactive, watch } from 'vue';

import {
    PButton, PPaneLayout,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import SectionHeader from '@/services/asset-inventory/collector/collector-detail/modules/SectionHeader.vue';
import type { CollectorModel, CollectorUpdateParameter } from '@/services/asset-inventory/collector/model';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorScheduleForm
    from '@/services/asset-inventory/collector/shared/collector-forms/CollectorScheduleForm.vue';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const state = reactive({
    isEditMode: false,
    updateLoading: false,
});

const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdateParameter = {
        collector_id: collectorFormStore.collectorId,
        schedule: {
            state: collectorFormState.schedulePower ? 'ENABLED' : 'DISABLED',
            hours: collectorFormState.scheduleHours,
        },
    };
    return SpaceConnector.client.inventory.collector.update(params);
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
        collectorFormStore.setOriginCollector(collector);
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
    padding: 1rem;
    .button-group {
        margin-bottom: 1.5rem;
        .save-changes-button {
            margin-left: 1rem;
        }
    }
}
</style>
