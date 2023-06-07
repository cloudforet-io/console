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
                                     @update:editMode="handleUpdateEditMode"
            />

            <p-button v-if="state.isEditMode"
                      style-type="tertiary"
                      size="lg"
                      @click="handleClickCancel"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.CANCEL') }}
            </p-button>
            <p-button v-if="state.isEditMode"
                      style-type="primary"
                      size="lg"
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

import CollectorScheduleForm
    from '@/services/asset-inventory/collector/modules/CollectorScheduleForm.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/store/collector-form-store';

const collectorFormStore = useCollectorFormStore();

const state = reactive({
    isEditMode: false,
});

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

const handleClickSave = () => {
    state.isEditMode = false;
    // TODO: Save changes with api call
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
