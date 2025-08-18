<template>
    <p-pane-layout>
        <collector-detail-section-header :title="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE')"
                                         :edit-mode="state.isEditMode"
                                         :hide-edit-button="!props.hasReadWriteAccess || !collectorFormState.schedulePower || !isEditableCollector"
                                         @click-edit="handleClickEdit"
        />

        <div class="schedule-wrapper">
            <collector-schedule-form :hours-readonly="!state.isEditMode"
                                     :readonly="!props.hasReadWriteAccess || !isEditableCollector"
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
import {
    reactive, watch, computed,
} from 'vue';

import {
    PButton, PPaneLayout,
} from '@cloudforet/mirinae';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { CollectorUpdateParameters } from '@/api-clients/inventory/collector/schema/api-verbs/update';
import type { CollectorModel } from '@/api-clients/inventory/collector/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorDetailSectionHeader from '@/services/asset-inventory/components/CollectorDetailSectionHeader.vue';
import CollectorScheduleForm from '@/services/asset-inventory/components/CollectorFormSchedule.vue';
import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { getIsEditableCollector } from '@/services/asset-inventory/helpers/collector-editable-value-helper';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/stores/collector-form-store';

const props = defineProps<{
    hasReadWriteAccess?: boolean
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const appContextStore = useAppContextStore();

const { collectorAPI } = useCollectorApi();

const state = reactive({
    isEditMode: false,
    updateLoading: false,
});
const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);
const isEditableCollector = computed<boolean>(() => getIsEditableCollector(isAdminMode.value, originCollectorData.value));

/* Query */
const { data: originCollectorData } = useCollectorGetQuery({
    collectorId: computed(() => collectorFormState.collectorId),
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
    return collectorAPI.update(params);
};

const handleClickEdit = () => {
    state.isEditMode = true;
};

const handleClickCancel = () => {
    state.isEditMode = false;
    collectorFormStore.resetSchedule(originCollectorData.value, true);
};

const handleClickSave = async () => {
    try {
        state.updateLoading = true;
        await fetchCollectorUpdate();
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SCHEDULE'), '');
        state.isEditMode = false;
    } catch (error) {
        collectorFormStore.resetSchedule(originCollectorData.value, true);
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
