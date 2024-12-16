<script lang="ts" setup>
import ScheduleSettingForm from '@/common/components/schedule-setting-form/ScheduleSettingForm.vue';

const emit = defineEmits<{(e: 'schedule-form', value: {days: string[]; start: number; end: number; type: string;}): void}>();

/* Component */
const handleScheduleForm = (value: {days: string[]; start: number; end: number; type: string;}) => {
    emit('schedule-form', value);
};
</script>

<template>
    <div class="flex flex-col bg-white border border-primary-3 rounded-md py-8 px-4">
        <p class="text-2xl mb-4">
            {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.TITLE') }}
        </p>
        <schedule-setting-form @schedule-form="handleScheduleForm" />
    </div>
</template>
