<template>
    <p-pane-layout class="channel-card-wrapper">
        <div class="card-header">
            <p-toggle-button :value="isActivated"
                             :disabled="manageDisabled"
                             :state-text="channelData.protocol_name"
                             show-state-text
                             spacing="lg"
                             @change-toggle="onToggleChange"
            />
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
                                            :disable-edit="(editTarget && editTarget !== EDIT_TYPE.NAME) || manageDisabled"
                                            @change="onChange"
                                            @edit="onEdit"
            />
            <p-divider />
            <notification-channel-item-data :channel-data="channelData"
                                            :project-id="projectId"
                                            :disable-edit="(editTarget && editTarget !== EDIT_TYPE.DATA) || manageDisabled"
                                            @change="onChange"
                                            @edit="onEdit"
            />
            <p-divider v-if="projectId" />
            <notification-channel-item-level :channel-data="channelData"
                                             :project-id="projectId"
                                             :disable-edit="(editTarget && editTarget !== EDIT_TYPE.LEVEL) || manageDisabled"
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
                                             :disable-edit="(editTarget && editTarget !== EDIT_TYPE.TOPIC) || manageDisabled"
                                             @change="onChange"
                                             @edit="onEdit"
            />
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

import type { SetupContext } from 'vue';
import {
    reactive, toRefs,
} from 'vue';

import {
    PDivider, PIconButton, PPaneLayout, PToggleButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

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
import { EDIT_TYPE, PROTOCOL_TYPE } from '@/services/notification/modules/notification-channel-item/type';

// interface ParamType {
//     user_channel_id?: string;
//     project_channel_id?: string;
//     name?: string;
//     data?: any;
//     schedule?: any;
//     notification_level?: string;
// }

export const STATE_TYPE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;

export default {
    name: 'NotificationChannelItem',
    components: {
        NotificationChannelItemTopic,
        NotificationChannelItemSchedule,
        NotificationChannelItemLevel,
        NotificationChannelItemData,
        NotificationChannelItemName,
        DeleteModal,
        PPaneLayout,
        PToggleButton,
        PIconButton,
        PDivider,
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
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            isActivated: props.channelData?.state === STATE_TYPE.ENABLED,
            userChannelId: props.channelData?.user_channel_id,
            projectChannelId: props.channelData?.project_channel_id,
            editTarget: undefined,
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
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_ENABLE_PROJECT_CHANNEL'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_ENABLE_PROJECT_CHANNEL'));
            }
        };

        const enableUserChannel = async () => {
            try {
                await SpaceConnector.client.notification.userChannel.enable({
                    user_channel_id: state.userChannelId,
                });
                state.isActivated = true;
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_ENABLE_USER_CHANNEL'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_ENABLE_USER_CHANNEL'));
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
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_DISABLE_PROJECT_CHANNEL'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_DISABLE_PROJECT_CHANNEL'));
            }
        };

        const disableUserChannel = async () => {
            try {
                await SpaceConnector.client.notification.userChannel.disable({
                    user_channel_id: state.userChannelId,
                });
                state.isActivated = false;
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_DISABLE_USER_CHANNEL'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_DISABLE_USER_CHANNEL'));
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
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_DELETE_PROJECT_CHANNEL'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_DELETE_PROJECT_CHANNEL'));
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
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.ALT_S_DELETE_USER_CHANNEL'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.ALT_E_DELETE_USER_CHANNEL'));
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

        return {
            PROTOCOL_TYPE,
            EDIT_TYPE,
            ...toRefs(state),
            checkDeleteState,
            onToggleChange,
            onClickDelete,
            deleteChannelConfirm,
            onChange,
            onEdit,
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
}

.card-body {
    display: flex;
    flex-direction: column;
    margin-top: 0.75rem;
}
</style>
