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
            <collector-schedule-form :edit-hours="state.isEditMode" />

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
    from '@/services/asset-inventory/collector/collector-detail/modules/CollectorScheduleForm.vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types
const props = defineProps<{}>();
const state = reactive({
    isEditMode: false,
});

const handleClickEdit = () => {
    state.isEditMode = true;
};

const handleClickCancel = () => {
    state.isEditMode = false;
};

const handleClickSave = () => {
    state.isEditMode = false;
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
