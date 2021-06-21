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
            <notification-channel-item-name :channel-data="channelData" :project-id="projectId" @change="onChange" />
            <p-divider />
            <notification-channel-item-data :channel-data="channelData" :project-id="projectId" @change="onChange" />
            <p-divider v-if="projectId" />
            <notification-channel-item-level :channel-data="channelData" :project-id="projectId" @change="onChange" />
            <p-divider />
            <notification-channel-item-schedule :channel-data="channelData" :project-id="projectId" @change="onChange" />
            <p-divider />
            <notification-channel-item-topic :channel-data="channelData" :project-id="projectId" @change="onChange" />
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
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import DeleteModal from '@/common/modules/delete-modal/DeleteModal.vue';
import { i18n } from '@/translations';

import NotificationChannelItemName
    from '@/views/identity/user/modules/notification/notification-channel-item/NotificationChannelItemName.vue';
import NotificationChannelItemData
    from '@/views/identity/user/modules/notification/notification-channel-item/NotificationChannelItemData.vue';
import NotificationChannelItemLevel
    from '@/views/identity/user/modules/notification/notification-channel-item/NotificationChannelItemLevel.vue';
import NotificationChannelItemSchedule
    from '@/views/identity/user/modules/notification/notification-channel-item/NotificationChannelItemSchedule.vue';
import NotificationChannelItemTopic
    from '@/views/identity/user/modules/notification/notification-channel-item/NotificationChannelItemTopic.vue';

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
    SLACK = 'Slack Protocol',
    MEGAZONE = 'Megazone Voicecall Protocol'
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
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;


        const state = reactive({
            isActivated: props.channelData?.state === STATE_TYPE.ENABLED,
            userChannelId: props.channelData?.user_channel_id,
            projectChannelId: props.channelData?.project_channel_id,
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
            onClickDelete,
            deleteChannelConfirm,
            onChange,
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
