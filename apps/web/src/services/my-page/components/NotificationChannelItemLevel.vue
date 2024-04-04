<script setup lang="ts">
import {
    PBadge, PButton, PI,
} from '@spaceone/design-system';

import type { NotificationLevel } from '@/schema/notification/notification/type';

import NotificationAddLevel from '@/services/my-page/components/NotificationAddLevel.vue';
import { useNotificationItem } from '@/services/my-page/composables/notification-item';
import type { NotiChannelItem } from '@/services/my-page/types/notification-channel-item-type';

const props = withDefaults(defineProps<{
    channelData: NotiChannelItem;
    projectId?: string;
    disableEdit?: boolean;
}>(), {
    projectId: undefined,
    disableEdit: false,
});

const emit = defineEmits<{(event: 'change'): void;
    (event: 'edit', value?: NotificationLevel): void;
}>();

const {
    state: notificationItemState,
    cancelEdit,
    startEdit,
    updateProjectChannel,
} = useNotificationItem<NotificationLevel>({
    userChannelId: props.channelData.user_channel_id,
    projectChannelId: props.channelData.project_channel_id,
    isEditMode: false,
    dataForEdit: props.channelData.notification_level,
}, emit);

const saveChangedLevel = async () => {
    if (props.projectId) await updateProjectChannel('notification_level', notificationItemState.dataForEdit);
};

const onClickSave = async () => {
    await saveChangedLevel();
    emit('change');
};

const onChangeLevel = (level: NotificationLevel) => {
    notificationItemState.dataForEdit = level;
};

</script>

<template>
    <li v-if="props.projectId"
        class="content-wrapper"
        :class="{'edit-mode': notificationItemState.isEditMode}"
    >
        <p class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.NOTIFICATION_LEVEL') }}
        </p>
        <div v-if="notificationItemState.isEditMode"
             class="content"
        >
            <notification-add-level :notification-level="props.channelData.notification_level"
                                    @change="onChangeLevel"
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
                          @click="onClickSave"
                >
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <div v-else
             class="content"
        >
            <p-badge v-if="props.channelData.notification_level === 'LV1'"
                     style-type="secondary1"
                     badge-type="solid-outline"
                     class="level-badge"
            >
                {{ props.channelData.notification_level }}
            </p-badge>
            <p-badge v-if="props.channelData.notification_level === 'LV2'"
                     style-type="indigo500"
                     badge-type="solid-outline"
                     class="level-badge"
            >
                {{ props.channelData.notification_level }}
            </p-badge>
            <p-badge v-if="props.channelData.notification_level === 'LV3'"
                     style-type="peacock400"
                     badge-type="solid-outline"
                     class="level-badge"
            >
                {{ channelData.notification_level }}
            </p-badge>
            <p-badge v-if="props.channelData.notification_level === 'LV4'"
                     style-type="coral500"
                     badge-type="solid-outline"
                     class="level-badge"
            >
                {{ props.channelData.notification_level }}
            </p-badge>
            <p-badge v-if="props.channelData.notification_level === 'LV5'"
                     style-type="alert"
                     badge-type="solid-outline"
                     class="level-badge"
            >
                {{ channelData.notification_level }}
            </p-badge>
            <button class="edit-button"
                    :class="{'edit-disable': props.disableEdit}"
                    @click="startEdit('notification_level')"
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
.level-badge {
    @apply rounded;
}
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
