<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PBadge, PButton, PI,
} from '@spaceone/design-system';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ChannelItem } from '@/services/administration/iam/user/type';
import AddNotificationTopic from '@/services/notification/modules/AddNotificationTopic.vue';
import { useNotificationItem } from '@/services/notification/modules/notification-channel-item/composables';
import {
    EDIT_TYPE,
} from '@/services/notification/modules/notification-channel-item/type';

interface Props {
    channelData: ChannelItem;
    projectId: string;
    disableEdit: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'edit', value?: any): void;
    (e: 'change'): void;
}>();
const { t } = useI18n();

const state = reactive({
    topicModeForEdit: undefined,
    topicForEdit: props.channelData?.subscriptions,
    isTopicValid: false,
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

const setUserChannelSubscription = async () => {
    try {
        await SpaceConnector.client.notification.userChannel.setSubscription({
            user_channel_id: notificationItemState.userChannelId,
            is_subscribe: state.topicModeForEdit,
            subscriptions: state.topicForEdit,
        });
        showSuccessMessage(t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_TOPIC'), '');
        notificationItemState.isEditMode = false;
        emit('edit', undefined);
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_TOPIC'));
    }
};
const setProjectChannelSubscription = async () => {
    try {
        await SpaceConnector.client.notification.projectChannel.setSubscription({
            project_channel_id: notificationItemState.projectChannelId,
            is_subscribe: state.topicModeForEdit,
            subscriptions: state.topicForEdit,
        });
        showSuccessMessage(t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_TOPIC'), '');
        notificationItemState.isEditMode = false;
        emit('edit', undefined);
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_TOPIC'));
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

</script>

<template>
    <li class="content-wrapper"
        :class="{'edit-mode': notificationItemState.isEditMode}"
    >
        <span class="content-title">
            {{ t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') }}
        </span>
        <div v-if="notificationItemState.isEditMode"
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
                    {{ t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          size="sm"
                          :disabled="!state.isTopicValid"
                          @click="onClickSave"
                >
                    {{ t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
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
            <span v-else>{{ t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ALL') }}</span>
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
                <span class="edit-text">{{ t('IDENTITY.USER.NOTIFICATION.EDIT') }}</span>
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
