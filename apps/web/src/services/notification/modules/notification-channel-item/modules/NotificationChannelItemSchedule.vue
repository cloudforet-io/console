<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PI,
} from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { utcToTimezoneFormatter } from '@/services/administration/iam/user/lib/helper';
import AddNotificationSchedule from '@/services/notification/modules/AddNotificationSchedule.vue';
import { useNotificationItem } from '@/services/notification/modules/notification-channel-item/composables';
import {
    EDIT_TYPE,
} from '@/services/notification/modules/notification-channel-item/type';

interface Props {
    channelData: any;
    projectId: string;
    disableEdit: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'edit', value?: any): void;
    (e: 'change'): void;
}>();
const store = useStore();
const { t } = useI18n();

const timezoneForFormatter = computed(() => store.state.user.timezone).value;
const state = reactive({
    scheduleModeForEdit: props.channelData?.is_scheduled,
    scheduleForEdit: props.channelData?.schedule,
    isScheduleValid: false,
    displayStartHour: computed(() => utcToTimezoneFormatter(props.channelData?.schedule?.start_hour, timezoneForFormatter)),
    displayEndHour: computed(() => utcToTimezoneFormatter(props.channelData?.schedule?.end_hour, timezoneForFormatter)),
});
const {
    state: notificationItemState,
    cancelEdit,
    startEdit,
} = useNotificationItem({
    userChannelId: props.channelData?.user_channel_id,
    projectChannelId: props.channelData?.project_channel_id,
    isEditMode: false,
}, emit);

const onChangeSchedule = async (value) => {
    state.scheduleModeForEdit = value.is_scheduled;
    state.scheduleForEdit = value.schedule;
    state.isScheduleValid = value.isScheduleValid;
};

const setUserChannelSchedule = async () => {
    try {
        await SpaceConnector.client.notification.userChannel.setSchedule({
            user_channel_id: notificationItemState.userChannelId,
            is_scheduled: state.scheduleModeForEdit,
            schedule: state.scheduleForEdit,
        });
        showSuccessMessage(t('PLUGIN.COLLECTOR.MAIN.ALT_S_UPDATE_SCHEDULE_TITLE'), '');
        notificationItemState.isEditMode = false;
        emit('edit', undefined);
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_UPDATE_SCHEDULE_TITLE'));
    }
};
const setProjectChannelSchedule = async () => {
    try {
        await SpaceConnector.client.notification.projectChannel.setSchedule({
            project_channel_id: notificationItemState.projectChannelId,
            is_scheduled: state.scheduleModeForEdit,
            schedule: state.scheduleForEdit,
        });
        showSuccessMessage(t('PLUGIN.COLLECTOR.MAIN.ALT_S_UPDATE_SCHEDULE_TITLE'), '');
        notificationItemState.isEditMode = false;
        emit('edit', undefined);
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_UPDATE_SCHEDULE_TITLE'));
    }
};

const saveChangedSchedule = async () => {
    if (props.projectId) await setProjectChannelSchedule();
    else await setUserChannelSchedule();
};

const onClickSave = async () => {
    await saveChangedSchedule();
    emit('change');
};

</script>

<template>
    <li class="content-wrapper"
        :class="{'edit-mode': notificationItemState.isEditMode}"
    >
        <span class="content-title">
            {{ t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') }}
        </span>
        <div v-if="notificationItemState.isEditMode"
             class="content"
        >
            <add-notification-schedule :schedule="channelData.schedule"
                                       :is-scheduled="channelData.is_scheduled"
                                       @change="onChangeSchedule"
            />
            <div class="button-group">
                <p-button style-type="secondary"
                          size="sm"
                          class="cancel-button"
                          @click="cancelEdit"
                >
                    {{ t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          size="sm"
                          :disabled="!state.isScheduleValid"
                          @click="onClickSave"
                >
                    {{ t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <div v-else
             class="content"
        >
            <p v-if="channelData.schedule">
                <span v-for="day in channelData.schedule.day_of_week"
                      :key="day"
                > {{ day }}</span><br>
                {{ state.displayStartHour }}:00 ~ {{ state.displayEndHour }}:00
            </p>
            <span v-else>{{ t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME') }}</span>
            <button class="edit-button"
                    :class="{'edit-disable':disableEdit}"
                    @click="startEdit(EDIT_TYPE.SCHEDULE)"
            >
                <p-i name="ic_edit"
                     width="1rem"
                     height="1rem"
                     color="inherit"
                     class="edit-icon"
                />
                {{ t('IDENTITY.USER.NOTIFICATION.EDIT') }}
            </button>
        </div>
    </li>
</template>

<style lang="postcss" scoped>
@import '../styles/channelItem.pcss';
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
