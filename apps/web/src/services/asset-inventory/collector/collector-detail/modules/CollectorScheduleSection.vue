<template>
    <p-pane-layout>
        <p-heading :title="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button v-if="!state.isEditMode"
                          size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                          @click="handleClickEdit"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>

        <div class="schedule-wrapper">
            <collector-schedule-form :edit-mode="state.isEditMode"
                                     :disabled="state.updateLoading"
                                     @update:editMode="handleUpdateEditMode"
            />

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
    </p-pane-layout>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

import {
    PHeading, PButton, PPaneLayout,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel, CollectorUpdateParameter } from '@/services/asset-inventory/collector/model';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorScheduleForm
    from '@/services/asset-inventory/collector/shared/collector-forms/CollectorScheduleForm.vue';

const collectorFormStore = useCollectorFormStore();

const state = reactive({
    isEditMode: false,
    updateLoading: false,
});

const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdateParameter = {
        collector_id: collectorFormStore.collectorId,
        schedule: {
            hours: collectorFormStore.scheduleHours,
        },
    };
    return SpaceConnector.client.inventory.collector.update(params);
};

const handleClickEdit = () => {
    state.isEditMode = true;
};

const handleUpdateEditMode = (value: boolean) => {
    state.isEditMode = value;
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

</script>

<style lang="postcss" scoped>
.schedule-wrapper {
    padding: 1rem;
    .save-changes-button {
        margin-left: 1rem;
    }
}
</style>
