<template>
    <li v-if="projectId"
        class="content-wrapper"
        :class="{'edit-mode': isEditMode}"
    >
        <p class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.NOTIFICATION_LEVEL') }}
        </p>
        <div v-if="isEditMode"
             class="content"
        >
            <add-notification-level :notification-level="channelData.notification_level"
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
            <p-badge v-if="channelData.notification_level === 'LV1'"
                     style-type="secondary1"
                     badge-type="solid-outline"
                     class="level-badge"
            >
                {{ channelData.notification_level }}
            </p-badge>
            <p-badge v-if="channelData.notification_level === 'LV2'"
                     style-type="indigo500"
                     badge-type="solid-outline"
                     class="level-badge"
            >
                {{ channelData.notification_level }}
            </p-badge>
            <p-badge v-if="channelData.notification_level === 'LV3'"
                     style-type="peacock400"
                     badge-type="solid-outline"
                     class="level-badge"
            >
                {{ channelData.notification_level }}
            </p-badge>
            <p-badge v-if="channelData.notification_level === 'LV4'"
                     style-type="coral500"
                     badge-type="solid-outline"
                     class="level-badge"
            >
                {{ channelData.notification_level }}
            </p-badge>
            <p-badge v-if="channelData.notification_level === 'LV5'"
                     style-type="alert"
                     badge-type="solid-outline"
                     class="level-badge"
            >
                {{ channelData.notification_level }}
            </p-badge>
            <button class="edit-button"
                    :class="{'edit-disable':disableEdit}"
                    @click="startEdit(EDIT_TYPE.LEVEL)"
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

<script lang="ts">
import { toRefs } from 'vue';

import {
    PBadge, PButton, PI,
} from '@spaceone/design-system';

import AddNotificationLevel from '@/services/notification/modules/AddNotificationLevel.vue';
import { useNotificationItem } from '@/services/notification/modules/notification-channel-item/composables';
import {
    EDIT_TYPE,
    PARAM_KEY_TYPE,
    PROTOCOL_TYPE,
} from '@/services/notification/modules/notification-channel-item/type';

export default {
    name: 'NotificationChannelItemLevel',
    components: {
        PButton,
        PI,
        PBadge,
        AddNotificationLevel,
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
    setup(props, { emit }) {
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
            dataForEdit: props.channelData?.notification_level,
        });

        const saveChangedLevel = async () => {
            if (props.projectId) await updateProjectChannel(PARAM_KEY_TYPE.LEVEL, notificationItemState.dataForEdit);
        };

        const onClickSave = async () => {
            await saveChangedLevel();
            emit('change');
        };

        const onChangeLevel = (value) => {
            notificationItemState.dataForEdit = value.level;
        };

        return {
            EDIT_TYPE,
            PROTOCOL_TYPE,
            ...toRefs(notificationItemState),
            onClickSave,
            cancelEdit,
            startEdit,
            updateUserChannel,
            updateProjectChannel,
            onChangeLevel,
        };
    },
};
</script>

<style lang="postcss" scoped>
@import '../styles/channelItem.pcss';
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
