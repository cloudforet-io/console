<template>
    <li class="content-wrapper"
        :class="{'edit-mode': isEditMode}"
    >
        <p class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME') }}
        </p>
        <div v-if="isEditMode"
             class="content"
        >
            <p-field-group
                required
                :invalid-text="nameInvalidText"
                :invalid="isNameInvalid"
                class="base-info-input"
            >
                <p-text-input v-model="dataForEdit"
                              :invalid="isNameInvalid"
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
            <p>{{ channelData.name }}</p>
            <button class="edit-button"
                    :class="{'edit-disable':disableEdit}"
                    @click="startEdit(EDIT_TYPE.NAME, channelData.name)"
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
import { computed, reactive, toRefs } from 'vue';

import {
    PButton, PI, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useNotificationItem } from '@/services/notification/modules/notification-channel-item/composables';
import { EDIT_TYPE, PARAM_KEY_TYPE } from '@/services/notification/modules/notification-channel-item/type';

export default {
    name: 'NotificationChannelItemName',
    components: {
        PButton,
        PI,
        PFieldGroup,
        PTextInput,
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
            dataForEdit: props.channelData?.name,
        });
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
            if (props.projectId) await updateProjectChannel(PARAM_KEY_TYPE.NAME, notificationItemState.dataForEdit);
            else await updateUserChannel(PARAM_KEY_TYPE.NAME, notificationItemState.dataForEdit);
        };

        const onClickSave = async () => {
            await saveChangedName();
            emit('change');
        };

        return {
            EDIT_TYPE,
            ...toRefs(notificationItemState),
            ...toRefs(state),
            onClickSave,
            cancelEdit,
            startEdit,
            updateUserChannel,
            updateProjectChannel,
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
.p-field-group {
    margin-bottom: 0;
}
</style>
