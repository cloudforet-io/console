<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PI, PBadge,
} from '@cloudforet/mirinae';


import type { ProjectChannelSetScheduleParameters } from '@/schema/notification/project-channel/api-verbs/set-schedule';
import type { UserChannelSetScheduleParameters } from '@/schema/notification/user-channel/api-verbs/set-schedule';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { useGlobalConfigUiAffectsSchema } from '@/lib/config/global-config/composables/use-global-config-ui-affects-schema';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import type { DayType, ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
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
const alertManagerUiAffectSchema = useGlobalConfigUiAffectsSchema('ALERT_MANAGER');
const state = reactive({
    visibleUserNotification: computed<boolean>(() => alertManagerUiAffectSchema.value?.visibleUserNotification ?? false),
    scheduleModeForEdit: props.channelData.is_scheduled,
    scheduleForEdit: props.channelData.schedule,
    isScheduleValid: false,
    dayMapping: computed<Record<DayType, TranslateResult>>(() => ({
        MON: i18n.t('ALERT_MANAGER.NOTIFICATIONS.MONDAY'),
        TUE: i18n.t('ALERT_MANAGER.NOTIFICATIONS.TUESDAY'),
        WED: i18n.t('ALERT_MANAGER.NOTIFICATIONS.WEDNESDAY'),
        THU: i18n.t('ALERT_MANAGER.NOTIFICATIONS.THURSDAY'),
        FRI: i18n.t('ALERT_MANAGER.NOTIFICATIONS.FRIDAY'),
        SAT: i18n.t('ALERT_MANAGER.NOTIFICATIONS.SATURDAY'),
        SUN: i18n.t('ALERT_MANAGER.NOTIFICATIONS.SUNDAY'),
    })),
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

const getScheduleInfo = (schedule: ScheduleSettingFormType) => {
    const scheduleInfo = {
        styleType: '', value: '' as TranslateResult, days: [] as TranslateResult[], time: '', timezone: '',
    };


    const formatTime = (time: number | undefined, defaultTime: number): string => `${String(time ?? defaultTime).padStart(2, '0')}:00`;
    Object.entries(schedule).forEach(([day, s]) => {
        if (day === 'SCHEDULE_TYPE') return;

        if (day === 'TIMEZONE') {
            scheduleInfo.timezone = s as string;
            return;
        }
        const scheduleDay = s;
        if (!scheduleDay) return;

        const startTime = formatTime(scheduleDay.start, 0);
        const endTime = formatTime(scheduleDay.end, 24);
        if (schedule.SCHEDULE_TYPE === 'WEEK_DAY') {
            scheduleInfo.days = Object.values(state.dayMapping).slice(0, 5).map((d) => d as TranslateResult);
            if (scheduleDay?.is_scheduled) {
                scheduleInfo.time = `${startTime} ~ ${endTime}`;
            }
        } else if (schedule.SCHEDULE_TYPE === 'ALL_DAY') {
            scheduleInfo.days = Object.values(state.dayMapping).map((d) => d as TranslateResult);
            scheduleInfo.time = `${startTime} ~ ${endTime}`;
        } else if (scheduleDay?.is_scheduled) {
            scheduleInfo.days.push(state.dayMapping[day]);
            scheduleInfo.time = `${startTime} ~ ${endTime}`;
        }
    });

    switch (schedule.SCHEDULE_TYPE) {
    case 'WEEK_DAY':
        scheduleInfo.styleType = 'secondary1';
        scheduleInfo.value = i18n.t('COMMON.SCHEDULE_SETTING.WEEKDAYS');
        break;
    case 'ALL_DAY':
        scheduleInfo.styleType = 'primary1';
        scheduleInfo.value = i18n.t('COMMON.SCHEDULE_SETTING.EVERYDAY');
        break;
    default:
        scheduleInfo.styleType = 'coral500';
        scheduleInfo.value = i18n.t('COMMON.SCHEDULE_SETTING.CUSTOM');
        break;
    }


    return {
        ...scheduleInfo,
        days: scheduleInfo.days.join(', '),
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
                                       :visible-user-notification="state.visibleUserNotification"
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
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                        <p>{{ $t('ALERT_MANAGER.NOTIFICATIONS.DAY') }}:</p>
                        <p-badge badge-type="solid-outline"
                                 :style-type="getScheduleInfo(props.channelData.schedule).styleType"
                        >
                            {{ getScheduleInfo(props.channelData.schedule).value }}
                        </p-badge>
                        <p>{{ getScheduleInfo(props.channelData.schedule).days }}</p>
                    </div>
                    <p>{{ $t('ALERT_MANAGER.NOTIFICATIONS.TIME') }}: {{ getScheduleInfo(props.channelData.schedule).time }}</p>
                    <p class="text-gray-500">
                        {{ $t('ALERT_MANAGER.TIMEZONE') }}: {{ getScheduleInfo(props.channelData.schedule).timezone }}
                    </p>
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
