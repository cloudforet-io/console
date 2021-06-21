<template>
    <li class="content-wrapper" :class="{'edit-mode': isEditMode}">
        <p class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME') }}
        </p>
        <div v-if="isEditMode" class="content">
            <p-text-input v-model="dataForEdit"
                          class="block"
            />
            <div class="button-group">
                <p-button :outline="true" class="text-button" @click="cancelEdit">
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button
                    style-type="primary"
                    class="text-button"
                    @click="onClickSave"
                >
                    {{ $t('COMMON.TAGS.SAVE') }}
                </p-button>
            </div>
        </div>
        <div v-else class="content">
            <p>{{ channelData.name }}</p>
            <button class="edit-btn" @click="startEdit">
                <p-i name="ic_edit" width="1rem" height="1rem"
                     color="inherit" class="edit-icon"
                />
                {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
            </button>
        </div>
    </li>
</template>

<script lang="ts">
import { PButton, PI, PTextInput } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { useNotificationItem } from '@/views/identity/user/modules/notification/notification-channel-item/hooks';
import { PARAM_KEY_TYPE } from '@/views/identity/user/modules/notification/notification-channel-item/type';


export default {
    name: 'NotificationChannelItemName',
    components: {
        PButton,
        PI,
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

        const saveChangedName = async () => {
            if (props.projectId) await updateProjectChannel(PARAM_KEY_TYPE.NAME, notificationItemState.dataForEdit);
            else await updateUserChannel(PARAM_KEY_TYPE.NAME, notificationItemState.dataForEdit);
        };

        const onClickSave = async () => {
            await saveChangedName();
            emit('change');
        };

        return {
            ...toRefs(notificationItemState),
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
@import './styles/channelItem.pcss';
</style>
