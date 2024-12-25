<script lang="ts" setup>
import type {
    ServiceChannelScheduleDayType,
    ServiceChannelScheduleInfoType,
} from '@/schema/alert-manager/service-channel/type';

import type { ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ScheduleSettingForm from '@/common/components/schedule-setting-form/ScheduleSettingForm.vue';

import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();

/* Component */
const handleScheduleForm = (value: ScheduleSettingFormType) => {
    // TODO: Plz check the type of value (to SY)
    notificationChannelCreateFormStore.$patch((_state) => {
        _state.state.scheduleInfo = convertScheduleInfo(value);
    });
};

const convertScheduleInfo = (scheduleInfo: any): ServiceChannelScheduleInfoType => {
    const defaultSchedule: ServiceChannelScheduleDayType = {
        is_scheduled: false,
        start: scheduleInfo.start,
        end: scheduleInfo.end,
    };

    const scheduledDays = new Set(scheduleInfo.days);

    return {
        SCHEDULE_TYPE: scheduleInfo.type,
        MON: { ...defaultSchedule, is_scheduled: scheduledDays.has('MON') },
        TUE: { ...defaultSchedule, is_scheduled: scheduledDays.has('TUE') },
        WED: { ...defaultSchedule, is_scheduled: scheduledDays.has('WED') },
        THU: { ...defaultSchedule, is_scheduled: scheduledDays.has('THU') },
        FRI: { ...defaultSchedule, is_scheduled: scheduledDays.has('FRI') },
        SAT: { ...defaultSchedule, is_scheduled: scheduledDays.has('SAT') },
        SUN: { ...defaultSchedule, is_scheduled: scheduledDays.has('SUN') },
    };
};
</script>

<template>
    <div class="flex flex-col bg-white border border-primary-3 rounded-md py-8 px-4">
        <p class="text-2xl mb-4">
            {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.TITLE') }}
        </p>
        <schedule-setting-form @update-form="handleScheduleForm" />
    </div>
</template>
