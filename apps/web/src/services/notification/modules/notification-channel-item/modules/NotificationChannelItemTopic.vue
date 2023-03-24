<template>
    <li class="content-wrapper"
        :class="{'edit-mode': isEditMode}"
    >
        <span class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') }}
        </span>
        <div v-if="isEditMode"
             class="content"
        >
            <add-notification-topic :topic="channelData.subscriptions"
                                    :topic-mode="channelData.is_subscribe"
                                    @change="onChangeTopic"
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
                          :disabled="!isTopicValid"
                          @click="onClickSave"
                >
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <div v-else
             class="content"
        >
            <ul v-if="channelData.subscriptions.length > 0">
                <li v-for="(item, index) in channelData.subscriptions"
                    :key="`topic-${index}`"
                >
                    <p-badge style-type="gray200"
                             badge-type="subtle"
                             shape="square"
                    >
                        <span v-if="item === 'monitoring.Alert'">Alert</span>
                        <span v-else-if="item === 'cost_analysis.Budget'">Budget</span>
                        <span v-else>{{ item }}</span>
                    </p-badge>
                </li>
            </ul>
            <span v-else>{{ $t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ALL') }}</span>
            <button class="edit-button"
                    :class="{'edit-disable':disableEdit}"
                    @click="startEdit(EDIT_TYPE.TOPIC)"
            >
                <p-i name="ic_edit"
                     width="1rem"
                     height="1rem"
                     color="inherit"
                     class="edit-icon"
                />
                <span class="edit-text">{{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}</span>
            </button>
        </div>
    </li>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import { reactive, toRefs } from 'vue';

import {
    PBadge, PButton, PI,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AddNotificationTopic from '@/services/notification/modules/AddNotificationTopic.vue';
import { useNotificationItem } from '@/services/notification/modules/notification-channel-item/composables';
import {
    EDIT_TYPE,
    PROTOCOL_TYPE,
} from '@/services/notification/modules/notification-channel-item/type';

export default {
    name: 'NotificationChannelItemTopic',
    components: {
        PButton,
        PI,
        PBadge,
        AddNotificationTopic,
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
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            topicModeForEdit: undefined,
            topicForEdit: props.channelData?.subscriptions,
            isTopicValid: false,
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

        const setUserChannelSubscription = async () => {
            try {
                await SpaceConnector.client.notification.userChannel.setSubscription({
                    user_channel_id: notificationItemState.userChannelId,
                    is_subscribe: state.topicModeForEdit,
                    subscriptions: state.topicForEdit,
                });
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_TOPIC'), '');
                notificationItemState.isEditMode = false;
                emit('edit', undefined);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_TOPIC'));
            }
        };
        const setProjectChannelSubscription = async () => {
            try {
                await SpaceConnector.client.notification.projectChannel.setSubscription({
                    project_channel_id: notificationItemState.projectChannelId,
                    is_subscribe: state.topicModeForEdit,
                    subscriptions: state.topicForEdit,
                });
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_TOPIC'), '');
                notificationItemState.isEditMode = false;
                emit('edit', undefined);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_TOPIC'));
            }
        };
        const onChangeTopic = (value) => {
            state.topicModeForEdit = value.topicMode;
            state.topicForEdit = value.selectedTopic;
            state.isTopicValid = value.isTopicValid;
        };
        const saveChangedTopic = async () => {
            if (props.projectId) await setProjectChannelSubscription();
            else await setUserChannelSubscription();
        };

        const onClickSave = async () => {
            await saveChangedTopic();
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
            onChangeTopic,
        };
    },
};
</script>

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
