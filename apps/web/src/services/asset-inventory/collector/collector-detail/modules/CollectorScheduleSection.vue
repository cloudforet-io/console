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
                                     :utc-hours="state.updatingUtcHours"
                                     @update:hours="handleUpdateHours"
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
import { defineProps, reactive } from 'vue';

import {
    PHeading, PButton, PPaneLayout,
} from '@spaceone/design-system';

import CollectorScheduleForm
    from '@/services/asset-inventory/collector/modules/CollectorScheduleForm.vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types
const props = defineProps<{}>();
const state = reactive({
    isEditMode: false,
    collectorScheduleUtcHours: [] as string[],
    updatingUtcHours: [] as string[],
});

const handleClickEdit = () => {
    state.isEditMode = true;
    state.updatingUtcHours = [...state.collectorScheduleUtcHours];
};

const handleUpdateHours = (hours: string[]) => {
    state.updatingUtcHours = hours;
};

const handleClickCancel = () => {
    state.isEditMode = false;
    state.updatingUtcHours = [...state.collectorScheduleUtcHours];
};

const handleClickSave = () => {
    state.isEditMode = false;
    // TODO: Save changes
    state.collectorScheduleUtcHours = [...state.updatingUtcHours];
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
