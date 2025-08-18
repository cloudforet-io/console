<script lang="ts" setup>
import {
    computed, watchEffect,
} from 'vue';

import type { ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ScheduleSettingForm from '@/common/components/schedule-setting-form/ScheduleSettingForm.vue';

import { useUserGroupChannelGetQuery } from '@/services/iam/composables/use-user-group-channel-get-query';
import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';


const userGroupPageStore = useUserGroupPageStore();
const userGroupPageGetters = userGroupPageStore.getters;

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

const channelId = computed(() => userGroupPageGetters.selectedUserGroupChannel?.[0]?.channel_id ?? '');

const { userGroupChannelData } = useUserGroupChannelGetQuery();

/* Component */
const handleScheduleForm = (value: ScheduleSettingFormType) => {
    notificationChannelCreateFormStore.updateScheduleInfo(value);
};

watchEffect(() => {
    if (userGroupChannelData.value?.schedule) {
        notificationChannelCreateFormStore.updateScheduleInfo(userGroupChannelData.value.schedule);
    }
});
</script>

<template>
    <div class="flex flex-col bg-white border border-primary-3 rounded-md py-8 px-4">
        <p class="text-2xl mb-4">
            {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.TITLE') }}
        </p>
        <schedule-setting-form
            :key="channelId"
            :schedule-form="notificationChannelCreateFormState.scheduleInfo"
            @update-form="handleScheduleForm"
        />
    </div>
</template>
