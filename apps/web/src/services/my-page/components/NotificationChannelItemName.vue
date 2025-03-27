<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PI, PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useNotificationItem } from '@/services/my-page/composables/notification-item';
import type { NotiChannelItem, NotiChannelItemV1 } from '@/services/my-page/types/notification-channel-item-type';

const props = withDefaults(defineProps<{
    channelData: Partial<NotiChannelItemV1> & Partial<NotiChannelItem>;
    projectId?: string;
    disableEdit?: boolean;
    visibleUserNotification: boolean;
}>(), {
    projectId: undefined,
    disableEdit: false,
    visibleUserNotification: false,
});

const emit = defineEmits<{(event: 'change'): void;
    (event: 'edit', value?: string): void;
}>();
const {
    state: notificationItemState,
    cancelEdit,
    startEdit,
    updateUserChannel,
    updateProjectChannel,
} = useNotificationItem<string>({
    userChannelId: props.visibleUserNotification ? props.channelData.channel_id : props.channelData.user_channel_id,
    projectChannelId: props.visibleUserNotification ? '' : props.channelData.project_channel_id,
    isEditMode: false,
    dataForEdit: props.channelData.name,
}, emit);
const state = reactive({
    nameInvalidText: computed(() => {
        if (notificationItemState.dataForEdit !== undefined && notificationItemState.dataForEdit.length === 0) {
            return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
        }
        if (notificationItemState.dataForEdit !== undefined && notificationItemState.dataForEdit.length > 40) {
            return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_INVALID_TEXT');
        }
        return undefined;
    }),
    isNameInvalid: computed(() => !!state.nameInvalidText),
});

const saveChangedName = async () => {
    if (!props.visibleUserNotification && props.projectId) await updateProjectChannel('name', notificationItemState.dataForEdit);
    else await updateUserChannel('name', notificationItemState.dataForEdit);
};

const onClickSave = async () => {
    await saveChangedName();
    emit('change');
};

</script>

<template>
    <li class="content-wrapper"
        :class="{'edit-mode': notificationItemState.isEditMode}"
    >
        <p class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME') }}
        </p>
        <div v-if="notificationItemState.isEditMode"
             class="content"
        >
            <p-field-group
                required
                :invalid-text="state.nameInvalidText"
                :invalid="state.isNameInvalid"
                class="base-info-input"
            >
                <p-text-input v-model="notificationItemState.dataForEdit"
                              :invalid="state.isNameInvalid"
                />
            </p-field-group>
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
                          @click="onClickSave"
                >
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <div v-else
             class="content"
        >
            <p>{{ props.channelData.name }}</p>
            <button class="edit-button"
                    :class="{'edit-disable': props.disableEdit}"
                    @click="startEdit('name', props.channelData.name)"
            >
                <p-i name="ic_edit"
                     width="1rem"
                     height="1rem"
                     color="inherit"
                     class="edit-icon"
                />
                {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
            </button>
        </div>
    </li>
</template>

<style lang="postcss" scoped>
@import '../styles/NotificationChannelItem.pcss';
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
.p-field-group {
    margin-bottom: 0;
}
</style>
