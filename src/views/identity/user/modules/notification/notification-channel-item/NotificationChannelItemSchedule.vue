<template>
    <li class="content-wrapper" :class="{'edit-mode': isEditMode}">
        <span class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') }}
        </span>
        <div v-if="isEditMode" class="content">
            <add-notification-schedule :schedule="channelData.schedule" :is-scheduled="channelData.is_scheduled" @change="onChangeSchedule" />
            <div class="button-group">
                <p-button :outline="true" size="sm" class="cancel-button"
                          @click="cancelEdit"
                >
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button
                    style-type="primary"
                    size="sm"
                    :disabled="!isScheduleValid"
                    @click="onClickSave"
                >
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <div v-else class="content">
            <p v-if="channelData.schedule">
                <span v-for="day in channelData.schedule.day_of_week" :key="day"> {{ day }}</span><br>
                {{ displayStartHour }}:00 ~ {{ displayEndHour }}:00
            </p>
            <span v-else>{{ $t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME') }}</span>
            <button class="edit-btn" :class="{'edit-disable':disableEdit}"
                    @click="startEdit(EDIT_TYPE.SCHEDULE)"
            >
                <p-i name="ic_edit" width="1rem" height="1rem"
                     color="inherit" class="edit-icon"
                />
                {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
            </button>
        </div>
    </li>
</template>

<script lang="ts">
import {
    PBadge, PButton, PI, PTextInput,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { useNotificationItem } from '@/views/identity/user/modules/notification/notification-channel-item/hooks';
import {
    EDIT_TYPE,
    PARAM_KEY_TYPE,
    PROTOCOL_TYPE,
} from '@/views/identity/user/modules/notification/notification-channel-item/type';
import { utcToTimezoneFormatter } from '@/views/identity/user/lib/helper';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { i18n } from '@/translations';
import { store } from '@/store';
import AddNotificationSchedule from '@/views/identity/user/modules/notification/AddNotificationSchedule.vue';


export default {
    name: 'NotificationChannelItemSchedule',
    components: {
        PButton,
        PI,
        AddNotificationSchedule,
    },
    props: {
        channelData: {
            type: Object,
            default: () => ({}),
        },
        projectId: {
            type: String,
            default: null,
        },
        disableEdit: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit, root }) {
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
            updateUserChannel,
            updateProjectChannel,
        } = useNotificationItem({
            userChannelId: props.channelData?.user_channel_id,
            projectChannelId: props.channelData?.project_channel_id,
            isEditMode: false,

        });


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
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_TOPIC'), '', root);
                notificationItemState.isEditMode = false;
                emit('edit', undefined);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_TOPIC'), e, root);
            }
        };
        const setProjectChannelSchedule = async () => {
            try {
                await SpaceConnector.client.notification.projectChannel.setSchedule({
                    project_channel_id: notificationItemState.projectChannelId,
                    is_scheduled: state.scheduleModeForEdit,
                    schedule: state.scheduleForEdit,
                });
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_PROJECT_CHANNEL'), '', root);
                notificationItemState.isEditMode = false;
                emit('edit', undefined);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_PROJECT_CHANNEL'), e, root);
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

        return {
            EDIT_TYPE,
            PROTOCOL_TYPE,
            ...toRefs(state),
            ...toRefs(notificationItemState),
            onClickSave,
            cancelEdit,
            startEdit,
            updateUserChannel,
            updateProjectChannel,
            onChangeSchedule,
        };
    },
};
</script>

<style lang="postcss" scoped>
@import './styles/channelItem.pcss';
.content-wrapper::v-deep .edit-btn {
    &.edit-disable {
        @apply text-gray-300 cursor-not-allowed;
        &:active {
            @apply pointer-events-none;
        }
    }
}
</style>
