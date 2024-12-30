<script lang="ts" setup>
import { ref, watch, watchEffect } from 'vue';

import type { ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ScheduleSettingForm from '@/common/components/schedule-setting-form/ScheduleSettingForm.vue';

import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

const scheduleSettingTypeData = ref<ScheduleSettingFormType>();

/* Component */
const handleScheduleForm = (value: ScheduleSettingFormType) => {
    scheduleSettingTypeData.value = value;
};

watch(() => notificationChannelCreateFormState.scheduleInfo, (nv_schedule_info) => {
    if (nv_schedule_info) {
        scheduleSettingTypeData.value = nv_schedule_info;
    }
}, { deep: true, immediate: true });

watchEffect(() => {
    notificationChannelCreateFormStore.$patch((_state) => {
        _state.state.scheduleInfo = scheduleSettingTypeData.value;
    });
});
</script>

<template>
    <div class="flex flex-col bg-white border border-primary-3 rounded-md py-8 px-4">
        <p class="text-2xl mb-4">
            {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.TITLE') }}
        </p>
        <schedule-setting-form
            :schedule-form="scheduleSettingTypeData"
            @update-form="handleScheduleForm"
        />
    </div>
</template>
