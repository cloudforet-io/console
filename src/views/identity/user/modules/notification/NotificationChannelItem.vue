<template>
    <p-pane-layout class="channel-card-wrapper">
        <div class="card-header">
            <div class="left-section">
                <p-toggle-button :value="isActivated"
                                 @change="onToggleChange"
                />
                <span class="card-title">{{ channelData.protocol_name }}</span>
            </div>
            <p-icon-button name="ic_trashcan" width="1.5rem" height="1.5rem"
                           @click="onClickDelete"
            />
        </div>
        <ul class="card-body">
            <li class="content-wrapper" :class="{'edit-mode': isNameEditMode}">
                <p class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME') }}
                </p>
                <div v-if="isNameEditMode" class="content">
                    <p-text-input v-model="channelNameForEdit"
                                  class="block"
                    />
                    <div class="button-group">
                        <p-button :outline="true" class="text-button" @click="cancelEdit(EDIT_TYPE.NAME)">
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            class="text-button"
                            @click="onClickSave(EDIT_TYPE.NAME)"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
                <div v-else class="content">
                    <p>{{ channelData.name }}</p>
                    <button class="edit-btn" @click="startEdit(EDIT_TYPE.NAME)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </div>
            </li>
            <p-divider />
            <li class="content-wrapper" :class="{'edit-mode': isDataEditMode}">
                <div class="content-title">
                    <p v-for="(item, index) in Object.keys(channelData.data)" :key="`channel-data-key-${index}`">
                        {{ item.replace(/\_/g, ' ') }}
                    </p>
                </div>
                <div v-if="isDataEditMode" class="content">
                    <div class="left-section">
                        <p v-if="Object.keys(dataListForEdit).includes('users')">
                            <add-notification-member-group :users="channelData.data.users" :project-id="projectId" @change="onChangeUser" />
                        </p>
                        <div v-else>
                            <p v-for="(item, index) in dataListForEdit" :key="`channel-editable-data-value-${index}`">
                                <p-text-input v-model="dataListForEdit[index]"
                                              class="block"
                                />
                            </p>
                        </div>
                    </div>
                    <div class="button-group">
                        <p-button :outline="true" class="text-button" @click="cancelEdit(EDIT_TYPE.DATA)">
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            class="text-button"
                            @click="onClickSave(EDIT_TYPE.DATA)"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
                <div v-else class="content">
                    <div class="left-section">
                        <div v-if="Object.keys(dataListForEdit).includes('users')">
                            <p-badge v-for="(item, index) in dataListForEdit.users" :key="`users-${index}`" style-type="gray900"
                                     outline
                                     class="mr-2"
                            >
                                {{ item }}
                            </p-badge>
                        </div>
                        <div v-else>
                            <p v-for="(item, index) in Object.values(channelData.data)" :key="`channel-data-value-${index}`">
                                <span v-if="channelData.protocol_name === PROTOCOL_TYPE.SLACK">{{ item.replace(/(?<=.{0})./gi, "*") }}</span>
                                <span v-else>{{ item }}</span>
                            </p>
                        </div>
                    </div>
                    <p v-if="channelData.protocol_name === PROTOCOL_TYPE.SLACK">
                        <info-message :message="$t('IDENTITY.USER.NOTIFICATION.CANNOT_EDIT_SLACK')" />
                    </p>
                    <button v-else class="edit-btn" @click="startEdit(EDIT_TYPE.DATA)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </div>
            </li>
            <p-divider v-if="projectId" />
            <li v-if="projectId" class="content-wrapper" :class="{'edit-mode': isLevelEditMode}">
                <p class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.NOTIFICATION_LEVEL') }}
                </p>
                <div v-if="isLevelEditMode" class="content">
                    <add-notification-level :notification-level="channelData.notification_level" @change="onChangeLevel" />
                    <div class="button-group">
                        <p-button :outline="true" class="text-button" @click="cancelEdit(EDIT_TYPE.LEVEL)">
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            class="text-button"
                            @click="onClickSave(EDIT_TYPE.LEVEL)"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
                <div v-else class="content">
                    <p>{{ channelData.notification_level }}</p>
                    <button class="edit-btn" @click="startEdit(EDIT_TYPE.LEVEL)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </div>
            </li>
            <p-divider />
            <li class="content-wrapper" :class="{'edit-mode': isScheduleEditMode}">
                <span class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') }}
                </span>
                <div v-if="isScheduleEditMode" class="content">
                    <add-notification-schedule :schedule="channelData.schedule" :is-scheduled="channelData.is_scheduled" @change="onChangeSchedule" />
                    <div class="button-group">
                        <p-button :outline="true" class="text-button" @click="cancelEdit(EDIT_TYPE.SCHEDULE)">
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            class="text-button"
                            @click="onClickSave(EDIT_TYPE.SCHEDULE)"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
                <div v-else class="content">
                    <p v-if="channelData.schedule">
                        <span v-for="day in channelData.schedule.day_of_week" :key="day"> {{ day }}</span><br>
                        {{ channelData.schedule.start_hour }}:00 ~ {{ channelData.schedule.end_hour }}:00
                    </p>
                    <span v-else>{{ $t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME') }}</span>
                    <button class="edit-btn" @click="startEdit(EDIT_TYPE.SCHEDULE)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </div>
            </li>
            <p-divider />
            <li class="content-wrapper" :class="{'edit-mode': isTopicEditMode}">
                <span class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') }}
                </span>
                <div v-if="isTopicEditMode" class="content">
                    <add-notification-topic :topic="channelData.subscriptions" :topic-mode="channelData.is_subscribe" @change="onChangeTopic" />
                    <div class="button-group">
                        <p-button :outline="true" class="text-button" @click="cancelEdit(EDIT_TYPE.TOPIC)">
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            class="text-button"
                            @click="onClickSave(EDIT_TYPE.TOPIC)"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
                <div v-else class="content">
                    <ul v-if="channelData.subscriptions.length > 0">
                        <li v-for="(item, index) in channelData.subscriptions" :key="`topic-${index}`">
                            <p-tag :deletable="false">
                                {{ item }}
                            </p-tag>
                        </li>
                    </ul>
                    <span v-else>{{$t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ALL')}}</span>
                    <button class="edit-btn" @click="startEdit(EDIT_TYPE.TOPIC)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </div>
            </li>
            <p-divider />
        </ul>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :contents="$t('IDENTITY.USER.NOTIFICATION.CHANNEL_DELETE_MODAL_TITLE')"
                      @confirm="deleteChannelConfirm"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PBadge, PDivider, PI, PIconButton, PPaneLayout, PTag, PToggleButton, PButton, PTextInput,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import AddNotificationSchedule from '@/views/identity/user/modules/notification/AddNotificationSchedule.vue';
import AddNotificationTopic from '@/views/identity/user/modules/notification/AddNotificationTopic.vue';
import AddNotificationLevel from '@/views/identity/user/modules/notification/AddNotificationLevel.vue';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import InfoMessage from '@/common/components/InfoMessage.vue';
import AddNotificationMemberGroup from '@/views/identity/user/modules/notification/AddNotificationMemberGroup.vue';
import DeleteModal from '@/common/modules/delete-modal/DeleteModal.vue';
import { i18n } from '@/translations';

enum EDIT_TYPE {
    NAME = 'name',
    DATA = 'data',
    SCHEDULE = 'schedule',
    TOPIC = 'topic',
    LEVEL = 'notification_level',
    USERS = 'users',
}

enum PROTOCOL_TYPE {
    AWS_SNS = 'AWS SNS',
    SLACK = 'Slack',
}

enum PARAM_KEY_TYPE {
    NAME = 'name',
    DATA = 'data',
    SCHEDULE = 'schedule',
    LEVEL = 'notification_level',
    USERS = 'users',
}

interface ParamType {
    user_channel_id?: string;
    project_channel_id?: string;
    name?: string;
    data?: object;
    schedule?: object;
    notification_level?: string;
}

export const STATE_TYPE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
export type STATE_TYPE = typeof STATE_TYPE[keyof typeof STATE_TYPE];

export default {
    name: 'NotificationChannelItem',
    components: {
        AddNotificationMemberGroup,
        AddNotificationLevel,
        AddNotificationTopic,
        AddNotificationSchedule,
        DeleteModal,
        PPaneLayout,
        PToggleButton,
        PI,
        PIconButton,
        PButton,
        PTextInput,
        PBadge,
        PDivider,
        PTag,
        InfoMessage,
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
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            isActivated: props.channelData?.state === STATE_TYPE.ENABLED,
            isNameEditMode: false,
            isDataEditMode: false,
            isScheduleEditMode: false,
            isTopicEditMode: false,
            isLevelEditMode: false,
            //
            userChannelId: props.channelData?.user_channel_id,
            projectChannelId: props.channelData?.project_channel_id,
            channelNameForEdit: props.channelData?.name,
            dataListForEdit: props.channelData?.data,
            scheduleModeForEdit: props.channelData?.is_scheduled,
            scheduleForEdit: props.channelData?.schedule,
            topicModeForEdit: undefined,
            topicForEdit: props.channelData?.subscriptions,
            notificationLevelForEdit: props.channelData?.notification_level,
        });
        const checkDeleteState = reactive({
            visible: false,
            headerTitle: i18n.t('IDENTITY.USER.NOTIFICATION.CHANNEL_DELETE_MODAL_TITLE'),
        });

        const enableProjectChannel = async () => {
            try {
                await SpaceConnector.client.notification.projectChannel.enable({
                    project_channel_id: state.projectChannelId,
                });
                state.isActivated = true;
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_ENABLE_PROJECT_CHANNEL'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_ENABLE_PROJECT_CHANNEL'), e, root);
            }
        };

        const enableUserChannel = async () => {
            try {
                await SpaceConnector.client.notification.userChannel.enable({
                    user_channel_id: state.userChannelId,
                });
                state.isActivated = true;
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_ENABLE_USER_CHANNEL'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_ENABLE_USER_CHANNEL'), e, root);
            }
        };

        const enableChannel = async () => {
            if (props.projectId) await enableProjectChannel();
            else await enableUserChannel();
        };

        const disableProjectChannel = async () => {
            try {
                await SpaceConnector.client.notification.projectChannel.disable({
                    project_channel_id: state.projectChannelId,
                });
                state.isActivated = false;
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_DISABLE_PROJECT_CHANNEL'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_DISABLE_PROJECT_CHANNEL'), e, root);
            }
        };

        const disableUserChannel = async () => {
            try {
                await SpaceConnector.client.notification.userChannel.disable({
                    user_channel_id: state.userChannelId,
                });
                state.isActivated = false;
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_DISABLE_USER_CHANNEL'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_DISABLE_USER_CHANNEL'), e, root);
            }
        };

        const disableChannel = async () => {
            if (props.projectId) await disableProjectChannel();
            else await disableUserChannel();
        };

        const onToggleChange = async (value) => {
            if (!value.value) await disableChannel();
            else await enableChannel();
        };

        const startEdit = (type: EDIT_TYPE) => {
            if (type === EDIT_TYPE.NAME) state.isNameEditMode = true;
            else if (type === EDIT_TYPE.DATA) state.isDataEditMode = true;
            else if (type === EDIT_TYPE.SCHEDULE) state.isScheduleEditMode = true;
            else if (type === EDIT_TYPE.TOPIC) state.isTopicEditMode = true;
            else if (type === EDIT_TYPE.LEVEL) state.isLevelEditMode = true;
        };
        const cancelEdit = (type: EDIT_TYPE) => {
            if (type === EDIT_TYPE.NAME) state.isNameEditMode = false;
            else if (type === EDIT_TYPE.DATA) state.isDataEditMode = false;
            else if (type === EDIT_TYPE.SCHEDULE) state.isScheduleEditMode = false;
            else if (type === EDIT_TYPE.TOPIC) state.isTopicEditMode = false;
            else if (type === EDIT_TYPE.LEVEL) state.isLevelEditMode = false;
        };

        const updateUserChannel = async (paramKey, paramValue) => {
            try {
                const param: ParamType = {
                    user_channel_id: state.userChannelId,
                };
                if (paramKey === PARAM_KEY_TYPE.NAME) param.name = paramValue;
                else if (paramKey === PARAM_KEY_TYPE.DATA) param.data = paramValue;
                await SpaceConnector.client.notification.userChannel.update(param);
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_USER_CHANNEL'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_USER_CHANNEL'), e, root);
            }
        };

        const updateProjectChannel = async (paramKey, paramValue) => {
            try {
                const param: ParamType = {
                    // eslint-disable-next-line camelcase
                    project_channel_id: state.projectChannelId,
                };
                if (paramKey === PARAM_KEY_TYPE.NAME) param.name = paramValue;
                else if (paramKey === PARAM_KEY_TYPE.DATA) param.data = paramValue;
                // eslint-disable-next-line camelcase
                else if (paramKey === PARAM_KEY_TYPE.LEVEL) param.notification_level = paramValue;
                await SpaceConnector.client.notification.projectChannel.update(param);
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_PROJECT_CHANNEL'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_PROJECT_CHANNEL'), e, root);
            }
        };

        const saveChangedName = async () => {
            if (props.projectId) await updateProjectChannel(PARAM_KEY_TYPE.NAME, state.channelNameForEdit);
            else await updateUserChannel(PARAM_KEY_TYPE.NAME, state.channelNameForEdit);
        };

        const saveChangedData = async () => {
            if (props.projectId) await updateProjectChannel(PARAM_KEY_TYPE.DATA, state.dataListForEdit);
            else await updateUserChannel(PARAM_KEY_TYPE.DATA, state.dataListForEdit);
        };

        const setUserChannelSchedule = async () => {
            try {
                await SpaceConnector.client.notification.userChannel.setSchedule({
                    user_channel_id: state.userChannelId,
                    is_scheduled: state.scheduleModeForEdit,
                    schedule: state.scheduleForEdit,
                });
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_TOPIC'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_TOPIC'), e, root);
            }
        };
        const setProjectChannelSchedule = async () => {
            try {
                await SpaceConnector.client.notification.projectChannel.setSchedule({
                    project_channel_id: state.projectChannelId,
                    is_scheduled: state.scheduleModeForEdit,
                    schedule: state.scheduleForEdit,
                });
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_USER_CHANNEL'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_PROJECT_CHANNEL'), e, root);
            }
        };
        const onChangeSchedule = async (value) => {
            state.scheduleModeForEdit = value.is_scheduled;
            state.scheduleForEdit = value.schedule;
        };
        const saveChangedSchedule = async () => {
            if (props.projectId) await setProjectChannelSchedule();
            else await setUserChannelSchedule();
        };

        const setUserChannelSubscription = async () => {
            try {
                await SpaceConnector.client.notification.userChannel.setSubscription({
                    user_channel_id: state.userChannelId,
                    is_subscribe: state.topicModeForEdit,
                    subscriptions: state.topicForEdit,
                });
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_TOPIC'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_TOPIC'), e, root);
            }
        };
        const setProjectChannelSubscription = async () => {
            try {
                await SpaceConnector.client.notification.projectChannel.setSubscription({
                    project_channel_id: state.projectChannelId,
                    is_subscribe: state.topicModeForEdit,
                    subscriptions: state.topicForEdit,
                });
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_TOPIC'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_TOPIC'), e, root);
            }
        };
        const onChangeTopic = (value) => {
            state.topicModeForEdit = value.topicMode;
            state.topicForEdit = value.selectedTopic;
        };
        const saveChangedTopic = async () => {
            if (props.projectId) await setProjectChannelSubscription();
            else await setUserChannelSubscription();
        };

        const onChangeLevel = (value) => {
            state.notificationLevelForEdit = value.level;
        };

        const saveChangedLevel = async () => {
            await updateProjectChannel(PARAM_KEY_TYPE.LEVEL, state.notificationLevelForEdit);
        };

        const onChangeUser = (value) => {
            state.dataListForEdit.users = value.users;
        };

        const onClickSave = async (type: EDIT_TYPE) => {
            if (type === EDIT_TYPE.NAME) {
                await saveChangedName();
                state.isNameEditMode = false;
            } else if (type === EDIT_TYPE.DATA) {
                await saveChangedData();
                state.isDataEditMode = false;
            } else if (type === EDIT_TYPE.SCHEDULE) {
                await saveChangedSchedule();
                state.isScheduleEditMode = false;
            } else if (type === EDIT_TYPE.TOPIC) {
                await saveChangedTopic();
                state.isTopicEditMode = false;
            } else if (type === EDIT_TYPE.LEVEL) {
                await saveChangedLevel();
                state.isLevelEditMode = false;
            }
            emit('change');
        };

        const onClickDelete = () => {
            checkDeleteState.visible = true;
        };

        const deleteProjectChannel = async () => {
            try {
                await SpaceConnector.client.notification.projectChannel.delete({
                    project_channel_id: state.projectChannelId,
                });
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_DELETE_PROJECT_CHANNEL'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_DELETE_PROJECT_CHANNEL'), e, root);
            } finally {
                checkDeleteState.visible = false;
                emit('confirm');
            }
        };

        const deleteUserChannel = async () => {
            try {
                await SpaceConnector.client.notification.userChannel.delete({
                    user_channel_id: state.userChannelId,
                });
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_DELETE_USER_CHANNEL'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_DELETE_USER_CHANNEL'), e, root);
            } finally {
                checkDeleteState.visible = false;
                emit('confirm');
            }
        };

        const deleteChannelConfirm = async () => {
            if (props.projectId) await deleteProjectChannel();
            else await deleteUserChannel();
        };

        return {
            EDIT_TYPE,
            PROTOCOL_TYPE,
            ...toRefs(state),
            checkDeleteState,
            onToggleChange,
            startEdit,
            cancelEdit,
            onChangeSchedule,
            onChangeTopic,
            onChangeLevel,
            onChangeUser,
            onClickSave,
            onClickDelete,
            deleteChannelConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.channel-card-wrapper {
    min-height: 13.375rem;
    padding: 1rem 1rem 2.531rem;
}
.card-header {
    display: flex;
    justify-content: space-between;
    .card-title {
        @apply font-bold;
        font-size: 1rem;
        line-height: 160%;
        margin-left: 1rem;
        margin-right: 0.5rem;
    }
}
.card-body {
    display: flex;
    flex-direction: column;
    margin-top: 0.75rem;
}
.content-wrapper {
    display: flex;
    flex-direction: row;
    min-height: 2.5rem;
    align-items: center;
    &.edit-mode {
        @apply bg-blue-100;
    }
    .content-title {
        @apply text-gray-600;
        min-width: 10.5rem;
        padding-left: 1rem;
        font-size: 0.875rem;
        line-height: 170%;
        text-transform: capitalize;
    }
    .content {
        display: inherit;
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
        font-size: 0.875rem;
        line-height: 170%;
        padding: 0.75rem 1rem;
        .left-section {
            display: inherit;
            flex-direction: column;
            gap: 0.125rem;
        }
    }
    .edit-btn {
        @apply text-blue-600;
        padding-right: 0.5rem;
        line-height: 160%;
        .edit-icon {
            margin-right: 0.25rem;
        }
        &:hover, &:active {
            @apply cursor-pointer;
        }
    }
    .button-group {
        justify-content: flex-end;
        flex-shrink: 0;
        .text-button {
            height: 1.5rem;
        }
    }
}

</style>
