<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDivider, PIconButton, PPaneLayout, PToggleButton, PFieldTitle,
} from '@spaceone/design-system';
import {
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ChannelItem } from '@/services/administration/iam/user/type';
import NotificationChannelItemData
    from '@/services/notification/modules/notification-channel-item/modules/NotificationChannelItemData.vue';
import NotificationChannelItemLevel
    from '@/services/notification/modules/notification-channel-item/modules/NotificationChannelItemLevel.vue';
import NotificationChannelItemName
    from '@/services/notification/modules/notification-channel-item/modules/NotificationChannelItemName.vue';
import NotificationChannelItemSchedule
    from '@/services/notification/modules/notification-channel-item/modules/NotificationChannelItemSchedule.vue';
import NotificationChannelItemTopic
    from '@/services/notification/modules/notification-channel-item/modules/NotificationChannelItemTopic.vue';
import { EDIT_TYPE } from '@/services/notification/modules/notification-channel-item/type';

// interface ParamType {
//     user_channel_id?: string;
//     project_channel_id?: string;
//     name?: string;
//     data?: any;
//     schedule?: any;
//     notification_level?: string;
// }
interface Props {
    channelData: ChannelItem;
    projectId: string;
    manageDisabled: boolean;
}

const STATE_TYPE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'change'): void;
    (e: 'confirm'): void;
}>();
const { t } = useI18n();

const state = reactive({
    isActivated: props.channelData?.state === STATE_TYPE.ENABLED,
    userChannelId: props.channelData?.user_channel_id,
    projectChannelId: props.channelData?.project_channel_id,
    editTarget: undefined,
});
const checkDeleteState = reactive({
    visible: false,
    headerTitle: t('IDENTITY.USER.NOTIFICATION.CHANNEL_DELETE_MODAL_TITLE'),
});

const enableProjectChannel = async () => {
    try {
        await SpaceConnector.client.notification.projectChannel.enable({
            project_channel_id: state.projectChannelId,
        });
        state.isActivated = true;
        showSuccessMessage(t('IDENTITY.USER.NOTIFICATION.ALT_S_ENABLE_PROJECT_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.NOTIFICATION.ALT_E_ENABLE_PROJECT_CHANNEL'));
    }
};

const enableUserChannel = async () => {
    try {
        await SpaceConnector.client.notification.userChannel.enable({
            user_channel_id: state.userChannelId,
        });
        state.isActivated = true;
        showSuccessMessage(t('IDENTITY.USER.NOTIFICATION.ALT_S_ENABLE_USER_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.NOTIFICATION.ALT_E_ENABLE_USER_CHANNEL'));
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
        showSuccessMessage(t('IDENTITY.USER.NOTIFICATION.ALT_S_DISABLE_PROJECT_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.NOTIFICATION.ALT_E_DISABLE_PROJECT_CHANNEL'));
    }
};

const disableUserChannel = async () => {
    try {
        await SpaceConnector.client.notification.userChannel.disable({
            user_channel_id: state.userChannelId,
        });
        state.isActivated = false;
        showSuccessMessage(t('IDENTITY.USER.NOTIFICATION.ALT_S_DISABLE_USER_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.NOTIFICATION.ALT_E_DISABLE_USER_CHANNEL'));
    }
};

const disableChannel = async () => {
    if (props.projectId) await disableProjectChannel();
    else await disableUserChannel();
};

const onToggleChange = async (value) => {
    if (!value) await disableChannel();
    else await enableChannel();
};

const onChange = async () => {
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
        showSuccessMessage(t('IDENTITY.USER.NOTIFICATION.ALT_S_DELETE_PROJECT_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.NOTIFICATION.ALT_E_DELETE_PROJECT_CHANNEL'));
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
        showSuccessMessage(t('IDENTITY.USER.NOTIFICATION.ALT_S_DELETE_USER_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.NOTIFICATION.ALT_E_DELETE_USER_CHANNEL'));
    } finally {
        checkDeleteState.visible = false;
        emit('confirm');
    }
};

const deleteChannelConfirm = async () => {
    if (props.projectId) await deleteProjectChannel();
    else await deleteUserChannel();
};

const onEdit = (value) => {
    state.editTarget = value;
};

</script>

<template>
    <p-pane-layout class="channel-card-wrapper">
        <div class="card-header">
            <p-field-title :label="channelData.protocol_name">
                <template #left>
                    <p-toggle-button :value="state.isActivated"
                                     :disabled="manageDisabled"
                                     class="toggle-button"
                                     @change-toggle="onToggleChange"
                    />
                </template>
            </p-field-title>
            <p-icon-button name="ic_delete"
                           width="1.5rem"
                           height="1.5rem"
                           :disabled="manageDisabled"
                           @click="onClickDelete"
            />
        </div>
        <ul class="card-body">
            <notification-channel-item-name :channel-data="channelData"
                                            :project-id="projectId"
                                            :disable-edit="(state.editTarget && state.editTarget !== EDIT_TYPE.NAME) || manageDisabled"
                                            @change="onChange"
                                            @edit="onEdit"
            />
            <p-divider />
            <notification-channel-item-data :channel-data="channelData"
                                            :project-id="projectId"
                                            :disable-edit="(state.editTarget && state.editTarget !== EDIT_TYPE.DATA) || manageDisabled"
                                            @change="onChange"
                                            @edit="onEdit"
            />
            <p-divider v-if="projectId" />
            <notification-channel-item-level :channel-data="channelData"
                                             :project-id="projectId"
                                             :disable-edit="(state.editTarget && state.editTarget !== EDIT_TYPE.LEVEL) || manageDisabled"
                                             @change="onChange"
                                             @edit="onEdit"
            />
            <p-divider />
            <notification-channel-item-schedule :channel-data="channelData"
                                                :project-id="projectId"
                                                :disable-edit="(editTarget && editTarget !== EDIT_TYPE.SCHEDULE) || manageDisabled"
                                                @change="onChange"
                                                @edit="onEdit"
            />
            <p-divider />
            <notification-channel-item-topic :channel-data="channelData"
                                             :project-id="projectId"
                                             :disable-edit="(state.editTarget && state.editTarget !== EDIT_TYPE.TOPIC) || manageDisabled"
                                             @change="onChange"
                                             @edit="onEdit"
            />
            <p-divider />
        </ul>
        <delete-modal v-model:visible="checkDeleteState.visible"
                      :header-title="checkDeleteState.headerTitle"
                      :contents="t('IDENTITY.USER.NOTIFICATION.CHANNEL_DELETE_MODAL_TITLE')"
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
