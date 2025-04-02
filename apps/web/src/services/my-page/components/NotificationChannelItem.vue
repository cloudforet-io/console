<script setup lang="ts">
import { reactive, nextTick, computed } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDivider, PIconButton, PPaneLayout, PToggleButton, PFieldTitle,
} from '@cloudforet/mirinae';


import type { UserChannelDisableParameters } from '@/schema/alert-manager/user-channel/api-verbs/disable';
import type { UserChannelEnableParameters } from '@/schema/alert-manager/user-channel/api-verbs/enable';
import type { ProjectChannelDeleteParameters } from '@/schema/notification/project-channel/api-verbs/delete';
import type { ProjectChannelDisableParameters } from '@/schema/notification/project-channel/api-verbs/disable';
import type { ProjectChannelEnableParameters } from '@/schema/notification/project-channel/api-verbs/enable';
import type { UserChannelDeleteParameters as UserChannelDeleteParametersV1 } from '@/schema/notification/user-channel/api-verbs/delete';
import type { UserChannelDisableParameters as UserChannelDisableParametersV1 } from '@/schema/notification/user-channel/api-verbs/disable';
import type { UserChannelEnableParameters as UserChannelEnableParametersV1 } from '@/schema/notification/user-channel/api-verbs/enable';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import NotificationChannelItemData
    from '@/services/my-page/components/NotificationChannelItemData.vue';
import NotificationChannelItemLevel
    from '@/services/my-page/components/NotificationChannelItemLevel.vue';
import NotificationChannelItemName
    from '@/services/my-page/components/NotificationChannelItemName.vue';
import NotificationChannelItemSchedule
    from '@/services/my-page/components/NotificationChannelItemSchedule.vue';
import NotificationChannelItemTopic
    from '@/services/my-page/components/NotificationChannelItemTopic.vue';
import type { NotiChannelItem, NotiChannelItemV1 } from '@/services/my-page/types/notification-channel-item-type';

const STATE_TYPE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;

const props = withDefaults(defineProps<{
    channelData: Partial<NotiChannelItemV1> & Partial<NotiChannelItem>;
    projectId?: string;
    manageDisabled?: boolean;
    visibleUserNotification: boolean;
}>(), {
    projectId: undefined,
    manageDisabled: false,
    visibleUserNotification: false,
});

const emit = defineEmits<{(event: 'change'): void;
    (event: 'confirm'): void;
}>();

type EditTarget = 'name' | 'data' | 'notification_level' | 'schedule' | 'topic';
const state = reactive({
    isActivated: props.channelData.state === STATE_TYPE.ENABLED,
    userChannelId: computed<string>(() => (props.visibleUserNotification ? props.channelData.channel_id : props.channelData.user_channel_id)),
    projectChannelId: props.channelData.project_channel_id,
    editTarget: undefined as EditTarget | undefined,
    scheduleData: props.channelData.schedule,
});
const checkDeleteState = reactive({
    visible: false,
    headerTitle: i18n.t('MY_PAGE.NOTIFICATION.CHANNEL_DELETE_MODAL_TITLE'),
});

const enableProjectChannel = async () => {
    try {
        if (!state.projectChannelId) throw new Error('Project channel id is not defined');
        await SpaceConnector.clientV2.notification.projectChannel.enable<ProjectChannelEnableParameters>({
            project_channel_id: state.projectChannelId,
        });
        state.isActivated = true;
        showSuccessMessage(i18n.t('MY_PAGE.NOTIFICATION.ALT_S_ENABLE_PROJECT_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MY_PAGE.NOTIFICATION.ALT_E_ENABLE_PROJECT_CHANNEL'));
    }
};

const enableUserChannel = async () => {
    try {
        if (!state.userChannelId) throw new Error('User channel id is not defined');
        const fetcher = props.visibleUserNotification
            ? SpaceConnector.clientV2.alertManager.userChannel.enable<UserChannelEnableParameters>({
                channel_id: state.userChannelId,
            })
            : SpaceConnector.clientV2.notification.userChannel.enable<UserChannelEnableParametersV1>({
                user_channel_id: state.userChannelId,
            });
        await fetcher;
        state.isActivated = true;
        showSuccessMessage(i18n.t('MY_PAGE.NOTIFICATION.ALT_S_ENABLE_USER_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MY_PAGE.NOTIFICATION.ALT_E_ENABLE_USER_CHANNEL'));
    }
};

const enableChannel = async () => {
    if (!props.visibleUserNotification && props.projectId) await enableProjectChannel();
    else await enableUserChannel();
};

const disableProjectChannel = async () => {
    try {
        if (!state.projectChannelId) throw new Error('Project channel id is not defined');
        await SpaceConnector.clientV2.notification.projectChannel.disable<ProjectChannelDisableParameters>({
            project_channel_id: state.projectChannelId,
        });
        state.isActivated = false;
        showSuccessMessage(i18n.t('MY_PAGE.NOTIFICATION.ALT_S_DISABLE_PROJECT_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MY_PAGE.NOTIFICATION.ALT_E_DISABLE_PROJECT_CHANNEL'));
        throw e;
    }
};

const disableUserChannel = async () => {
    try {
        if (!state.userChannelId) throw new Error('User channel id is not defined');
        const fetcher = props.visibleUserNotification
            ? SpaceConnector.clientV2.alertManager.userChannel.disable<UserChannelDisableParameters>({
                channel_id: state.userChannelId,
            }) : SpaceConnector.clientV2.notification.userChannel.disable<UserChannelDisableParametersV1>({
                user_channel_id: state.userChannelId,
            });
        await fetcher;
        state.isActivated = false;
        showSuccessMessage(i18n.t('MY_PAGE.NOTIFICATION.ALT_S_DISABLE_USER_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MY_PAGE.NOTIFICATION.ALT_E_DISABLE_USER_CHANNEL'));
        throw e;
    }
};

const disableChannel = async () => {
    if (!props.visibleUserNotification && props.projectId) await disableProjectChannel();
    else await disableUserChannel();
};

const onToggleChange = async (value: boolean) => {
    try {
        state.isActivated = value;
        if (!value) await disableChannel();
        else await enableChannel();
    } catch (e) {
        await nextTick();
        state.isActivated = !value;
    }
};

const onChange = async () => {
    emit('change');
};

const onClickDelete = () => {
    checkDeleteState.visible = true;
};

const deleteProjectChannel = async () => {
    try {
        if (!state.projectChannelId) throw new Error('Project channel id is not defined');
        await SpaceConnector.clientV2.notification.projectChannel.delete<ProjectChannelDeleteParameters>({
            project_channel_id: state.projectChannelId,
        });
        showSuccessMessage(i18n.t('MY_PAGE.NOTIFICATION.ALT_S_DELETE_PROJECT_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MY_PAGE.NOTIFICATION.ALT_E_DELETE_PROJECT_CHANNEL'));
    } finally {
        checkDeleteState.visible = false;
        emit('confirm');
    }
};

const deleteUserChannel = async () => {
    try {
        if (!state.userChannelId) throw new Error('User channel id is not defined');
        const fetcher = props.visibleUserNotification
            ? SpaceConnector.clientV2.alertManager.userChannel.delete<UserChannelDisableParameters>({
                channel_id: state.userChannelId,
            }) : SpaceConnector.clientV2.notification.userChannel.delete<UserChannelDeleteParametersV1>({
                user_channel_id: state.userChannelId,
            });
        await fetcher;
        showSuccessMessage(i18n.t('MY_PAGE.NOTIFICATION.ALT_S_DELETE_USER_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MY_PAGE.NOTIFICATION.ALT_E_DELETE_USER_CHANNEL'));
    } finally {
        checkDeleteState.visible = false;
        emit('confirm');
    }
};

const deleteChannelConfirm = async () => {
    if (!props.visibleUserNotification && props.projectId) {
        await deleteProjectChannel();
        return;
    }
    await deleteUserChannel();
};

const onEdit = (value?: EditTarget) => {
    state.editTarget = value;
};
</script>

<template>
    <p-pane-layout class="channel-card-wrapper">
        <div class="card-header">
            <p-field-title :label="props.channelData.protocol_name.toLowerCase().includes('spaceone') ? i18n.t('IAM.USER.NOTIFICATION.ASSOCIATED_MEMBER') : props.channelData.protocol_name">
                <template #left>
                    <p-toggle-button :value="state.isActivated"
                                     :disabled="props.manageDisabled"
                                     class="toggle-button"
                                     @change-toggle="onToggleChange"
                    />
                </template>
            </p-field-title>
            <p-icon-button name="ic_delete"
                           width="1.5rem"
                           height="1.5rem"
                           :disabled="props.manageDisabled"
                           @click="onClickDelete"
            />
        </div>
        <ul class="card-body">
            <notification-channel-item-name :channel-data="props.channelData"
                                            :project-id="props.projectId"
                                            :disable-edit="(state.editTarget && state.editTarget !== 'name') || props.manageDisabled"
                                            :visible-user-notification="props.visibleUserNotification"
                                            @change="onChange"
                                            @edit="onEdit"
            />
            <p-divider />
            <notification-channel-item-data :channel-data="props.channelData"
                                            :project-id="props.projectId"
                                            :disable-edit="(state.editTarget && state.editTarget !== 'data') || props.manageDisabled"
                                            :visible-user-notification="props.visibleUserNotification"
                                            @change="onChange"
                                            @edit="onEdit"
            />
            <p-divider v-if="projectId" />
            <notification-channel-item-level :channel-data="props.channelData"
                                             :project-id="props.projectId"
                                             :disable-edit="(state.editTarget && state.editTarget !== 'notification_level') || props.manageDisabled"
                                             @change="onChange"
                                             @edit="onEdit"
            />
            <p-divider />
            <notification-channel-item-schedule :channel-data="props.channelData"
                                                :project-id="props.projectId"
                                                :disable-edit="(state.editTarget && state.editTarget !== 'schedule') || props.manageDisabled"
                                                :visible-user-notification="props.visibleUserNotification"
                                                @change="onChange"
                                                @edit="onEdit"
            />
            <p-divider />
            <notification-channel-item-topic v-if="!props.visibleUserNotification"
                                             :channel-data="props.channelData"
                                             :project-id="props.projectId"
                                             :disable-edit="(state.editTarget && state.editTarget !== 'topic') || props.manageDisabled"
                                             @change="onChange"
                                             @edit="onEdit"
            />
            <p-divider v-if="!props.visibleUserNotification" />
        </ul>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :contents="$t('IAM.USER.NOTIFICATION.CHANNEL_DELETE_MODAL_TITLE')"
                      @confirm="deleteChannelConfirm"
        />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.channel-card-wrapper {
    min-height: 13.375rem;
    padding: 1rem 1rem 2.531rem;
}

.card-header {
    @apply flex items-center justify-between;
    .toggle-button {
        margin-right: 0.75rem;
    }
}

.card-body {
    display: flex;
    flex-direction: column;
    margin-top: 0.75rem;
}
</style>
