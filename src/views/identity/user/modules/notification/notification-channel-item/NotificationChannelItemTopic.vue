<template>
    <li class="content-wrapper" :class="{'edit-mode': isEditMode}">
        <span class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') }}
        </span>
        <div v-if="isEditMode" class="content">
            <add-notification-topic :topic="channelData.subscriptions" :topic-mode="channelData.is_subscribe" @change="onChangeTopic" />
            <div class="button-group">
                <p-button :outline="true" size="sm" class="cancel-button"
                          @click="cancelEdit"
                >
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button
                    style-type="primary"
                    size="sm"
                    :disabled="!isTopicValid"
                    @click="onClickSave"
                >
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <div v-else class="content">
            <ul v-if="channelData.subscriptions.length > 0">
                <li v-for="(item, index) in channelData.subscriptions" :key="`topic-${index}`">
                    <p-badge style-type="gray200" shape="square">
                        {{ item }}
                    </p-badge>
                </li>
            </ul>
            <span v-else>{{ $t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ALL') }}</span>
            <button class="edit-btn" :class="{'edit-disable':disableEdit}"
                    @click="startEdit(EDIT_TYPE.TOPIC)"
            >
                <p-i name="ic_edit" width="1rem" height="1rem"
                     color="inherit" class="edit-icon"
                />
                <span class="edit-text">{{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}</span>
            </button>
        </div>
    </li>
</template>

<script lang="ts">
import {
    PBadge, PButton, PI, PTag, PTextInput,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { useNotificationItem } from '@/views/identity/user/modules/notification/notification-channel-item/hooks';
import {
    EDIT_TYPE,
    PARAM_KEY_TYPE,
    PROTOCOL_TYPE,
} from '@/views/identity/user/modules/notification/notification-channel-item/type';
import { utcToTimezoneFormatter } from '@/views/identity/user/lib/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';
import { store } from '@/store';
import AddNotificationTopic from '@/views/identity/user/modules/notification/AddNotificationTopic.vue';


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
    setup(props, { emit, root }) {
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
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_TOPIC'), '', root);
                notificationItemState.isEditMode = false;
                emit('edit', undefined);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_TOPIC'), e, root);
            }
        };
        const setProjectChannelSubscription = async () => {
            try {
                await SpaceConnector.client.notification.projectChannel.setSubscription({
                    project_channel_id: notificationItemState.projectChannelId,
                    is_subscribe: state.topicModeForEdit,
                    subscriptions: state.topicForEdit,
                });
                showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_TOPIC'), '', root);
                notificationItemState.isEditMode = false;
                emit('edit', undefined);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_TOPIC'), e, root);
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
