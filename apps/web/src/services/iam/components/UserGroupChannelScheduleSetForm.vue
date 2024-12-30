<script lang="ts" setup>
import { ref, watch, watchEffect } from 'vue';

import { i18n } from '@/translations';

import type { ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ScheduleSettingForm from '@/common/components/schedule-setting-form/ScheduleSettingForm.vue';

import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

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
        <schedule-setting-form v-if="userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.UPDATE_TITLE')"
                               :schedule-form="scheduleSettingTypeData"
                               @update-form="handleScheduleForm"
        />
        <schedule-setting-form v-else
                               @update-form="handleScheduleForm"
        />
    </div>
</template>
