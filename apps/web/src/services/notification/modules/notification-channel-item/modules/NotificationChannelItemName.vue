<script lang="ts" setup>
import {
    PButton, PI, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ChannelItem } from '@/services/administration/iam/user/type';
import { useNotificationItem } from '@/services/notification/modules/notification-channel-item/composables';
import { EDIT_TYPE, PARAM_KEY_TYPE } from '@/services/notification/modules/notification-channel-item/type';

interface Props {
    channelData: ChannelItem;
    projectId: string;
    disableEdit: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'change'): void;
    (e: 'edit', value?: any): void;
}>();
const { t } = useI18n();

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
}, emit);
const state = reactive({
    nameInvalidText: computed(() => {
        if (notificationItemState.dataForEdit !== undefined && notificationItemState.dataForEdit.length === 0) {
            return t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
        }
        if (notificationItemState.dataForEdit !== undefined && notificationItemState.dataForEdit.length > 40) {
            return t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_INVALID_TEXT');
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

</script>

<template>
    <li class="content-wrapper"
        :class="{'edit-mode': state.isEditMode}"
    >
        <p class="content-title">
            {{ t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME') }}
        </p>
        <div v-if="state.isEditMode"
             class="content"
        >
            <p-field-group
                required
                :invalid-text="state.nameInvalidText"
                :invalid="state.isNameInvalid"
                class="base-info-input"
            >
                <p-text-input v-model:value="state.dataForEdit"
                              :invalid="state.isNameInvalid"
                />
            </p-field-group>
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
                          @click="onClickSave"
                >
                    {{ t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
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
                {{ t('IDENTITY.USER.NOTIFICATION.EDIT') }}
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
.p-field-group {
    margin-bottom: 0;
}
</style>
