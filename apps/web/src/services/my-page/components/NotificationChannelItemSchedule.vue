<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PI, PBadge,
} from '@cloudforet/mirinae';


import type { ProjectChannelSetScheduleParameters } from '@/schema/notification/project-channel/api-verbs/set-schedule';
import type { UserChannelSetScheduleParameters } from '@/schema/notification/user-channel/api-verbs/set-schedule';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import type { ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { utcToTimezoneFormatter } from '@/services/iam/helpers/user-notification-timezone-helper';
import NotificationAddSchedule from '@/services/my-page/components/NotificationAddSchedule.vue';
import { useNotificationItem } from '@/services/my-page/composables/notification-item';
import type { NotificationAddFormSchedulePayload } from '@/services/my-page/types/notification-add-form-type';
import type { NotiChannelItemV1, NotiChannelItem } from '@/services/my-page/types/notification-channel-item-type';

const props = withDefaults(defineProps<{
    channelData: Partial<NotiChannelItem> & Partial<NotiChannelItemV1>;
    projectId?: string;
    disableEdit?: boolean;
    visibleUserNotification: boolean;
}>(), {
    projectId: undefined,
    disableEdit: false,
    visibleUserNotification: false,
});

const emit = defineEmits<{(event: 'change'): void;
    (event: 'edit'): void;
}>();

const userStore = useUserStore();
const timezoneForFormatter = computed<string|undefined>(() => userStore.state.timezone).value;
const state = reactive({
    scheduleModeForEdit: props.channelData.is_scheduled,
    scheduleForEdit: props.channelData.schedule,
    isScheduleValid: false,
    displayStartHour: computed(() => utcToTimezoneFormatter((props.channelData.schedule?.start_hour || 0), timezoneForFormatter)),
    displayEndHour: computed(() => utcToTimezoneFormatter((props.channelData.schedule?.end_hour || 0), timezoneForFormatter)),
    scheduleSettingFormType: {} as ScheduleSettingFormType,
});
const {
    state: notificationItemState,
    cancelEdit,
    startEdit,
    updateUserChannel,
} = useNotificationItem<undefined>({
    userChannelId: props.visibleUserNotification ? props.channelData.channel_id : props.channelData.user_channel_id,
    projectChannelId: props.visibleUserNotification ? '' : props.channelData.project_channel_id,
    isEditMode: false,
}, emit);

const onChangeScheduleV1 = async (value: NotificationAddFormSchedulePayload) => {
    state.scheduleModeForEdit = value.is_scheduled;
    state.scheduleForEdit = value.schedule;
    state.isScheduleValid = value.isScheduleValid;
};

const onChangeSchedule = async (scheduleSettingFormType: ScheduleSettingFormType) => {
    state.scheduleSettingFormType = scheduleSettingFormType;
    state.isScheduleValid = true;
};

const setUserChannelSchedule = async () => {
    try {
        if (!notificationItemState.userChannelId) throw new Error('User channel id is not defined');
        await SpaceConnector.clientV2.notification.userChannel.setSchedule<UserChannelSetScheduleParameters>({
            user_channel_id: notificationItemState.userChannelId,
            is_scheduled: state.scheduleModeForEdit,
            schedule: state.scheduleForEdit,
        });
        showSuccessMessage(i18n.t('PLUGIN.COLLECTOR.MAIN.ALT_S_UPDATE_SCHEDULE_TITLE'), '');
        notificationItemState.isEditMode = false;
        emit('edit');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PLUGIN.COLLECTOR.MAIN.ALT_E_UPDATE_SCHEDULE_TITLE'));
    }
};
const setProjectChannelSchedule = async () => {
    try {
        if (!notificationItemState.projectChannelId) throw new Error('Project channel id is not defined');
        await SpaceConnector.clientV2.notification.projectChannel.setSchedule<ProjectChannelSetScheduleParameters>({
            project_channel_id: notificationItemState.projectChannelId,
            is_scheduled: state.scheduleModeForEdit,
            schedule: state.scheduleForEdit,
        });
        showSuccessMessage(i18n.t('PLUGIN.COLLECTOR.MAIN.ALT_S_UPDATE_SCHEDULE_TITLE'), '');
        notificationItemState.isEditMode = false;
        emit('edit');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PLUGIN.COLLECTOR.MAIN.ALT_E_UPDATE_SCHEDULE_TITLE'));
    }
};

const saveChangedSchedule = async () => {
    if (props.projectId) await setProjectChannelSchedule();
    else if (!props.visibleUserNotification) {
        await setUserChannelSchedule();
    } else {
        await updateUserChannel('schedule', state.scheduleSettingFormType);
    }
};

const onClickSave = async () => {
    await saveChangedSchedule();
    emit('change');
};

const SCHEDULE_TYPE_OPTIONS = {
    ALL_DAY: 'Every Day',
    CUSTOM: 'Custom',
    WEEK_DAY: 'Weekdays',
    WEEKEND: 'Weekend',
};
const getScheduleInfo = (schedule: ScheduleSettingFormType) => {
    const { SCHEDULE_TYPE } = schedule;
    let styleType: string;
    let label;
    switch (SCHEDULE_TYPE) {
    case 'ALL_DAY':
        styleType = 'indigo500';
        label = SCHEDULE_TYPE_OPTIONS.ALL_DAY;
        break;
    case 'CUSTOM':
        styleType = 'coral500';
        label = SCHEDULE_TYPE_OPTIONS.CUSTOM;
        break;
    case 'WEEK_DAY':
        styleType = 'secondary1';
        label = SCHEDULE_TYPE_OPTIONS.WEEK_DAY;
        break;
    default:
        styleType = 'gray900';
        label = SCHEDULE_TYPE_OPTIONS.WEEKEND;
        break;
    }
    return {
        styleType,
        label,
    };
};
</script>

<template>
    <li class="content-wrapper"
        :class="{'edit-mode': notificationItemState.isEditMode}"
    >
        <span class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') }}
        </span>
        <div v-if="notificationItemState.isEditMode"
             class="content"
        >
            <notification-add-schedule :schedule="props.channelData.schedule"
                                       :is-scheduled="props.channelData.is_scheduled"
                                       @changeV1="onChangeScheduleV1"
                                       @change="onChangeSchedule"
            />
            <div class="button-group">
                <p-button style-type="secondary"
                          size="sm"
                          class="cancel-button"
                          @click="cancelEdit"
                >
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          size="sm"
                          :disabled="!state.isScheduleValid"
                          @click="onClickSave"
                >
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <div v-else
             class="content"
        >
            <div v-if="!props.visibleUserNotification">
                <p v-if="Array.isArray(props.channelData.schedule?.day_of_week)">
                    <span v-for="day in props.channelData.schedule?.day_of_week"
                          :key="day"
                    > {{ day }}</span><br>
                    {{ state.displayStartHour }}:00 ~ {{ state.displayEndHour }}:00
                </p>
                <span v-else>{{ $t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME') }}</span>
            </div>
            <div v-else-if="props.visibleUserNotification">
                <div class="inline-flex items-center gap-2">
                    <p-badge badge-type="solid-outline"
                             :style-type="getScheduleInfo(props.channelData.schedule).styleType"
                    >
                        {{ getScheduleInfo(props.channelData.schedule).label }}
                    </p-badge>
                </div>
            </div>
            <button class="edit-button"
                    :class="{'edit-disable': props.disableEdit}"
                    @click="startEdit('schedule')"
            >
                <p-i name="ic_edit"
                     width="1rem"
                     height="1rem"
                     color="inherit"
                     class="edit-icon"
                />
                {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
            </button>
        </div>
    </li>
</template>

<style lang="postcss" scoped>
@import '../styles/NotificationChannelItem.pcss';
.content-wrapper .edit-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    &.edit-disable {
        @apply text-gray-300 cursor-not-allowed;
        &:active {
            @apply pointer-events-none;
        }
    }
}
</style>
