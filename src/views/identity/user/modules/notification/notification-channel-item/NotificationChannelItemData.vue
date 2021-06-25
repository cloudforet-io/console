<template>
    <li class="content-wrapper" :class="{'edit-mode': isEditMode}">
        <div class="content-title">
            <span v-if="channelData.protocol_name === PROTOCOL_TYPE.SLACK">
                Slack Channel <br>
                Slack Token
            </span>
            <p v-for="(item, index) in keyList" :key="`channel-data-key-${index}`">
                {{ item.replace(/\_/g, ' ') }}
            </p>
        </div>
        <div v-if="isEditMode" class="content">
            <div class="left-section">
                <p v-if="keyList.includes('users')">
                    <add-notification-member-group :users="channelData.data.users" :project-id="projectId" @change="onChangeUser" />
                </p>
                <div v-else>
                    <p v-for="(item, index) in dataForEdit" :key="`channel-editable-data-value-${index}`">
                        <p-text-input v-model="dataForEdit[index]"
                                      class="block"
                        />
                    </p>
                </div>
            </div>
            <div class="button-group">
                <p-button :outline="true" class="text-button" @click="cancelEdit">
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button
                    style-type="primary"
                    class="text-button"
                    @click="onClickSave"
                >
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <div v-else class="content">
            <div class="left-section">
                <div v-if="keyList.includes('users')">
                    <p-badge v-for="(item, index) in dataForEdit.users" :key="`users-${index}`"
                             style-type="gray200" shape="square"
                             class="mr-2 rounded"
                    >
                        {{ item }}
                    </p-badge>
                </div>

                <span v-else-if="channelData.protocol_name === PROTOCOL_TYPE.SLACK">
                    ********* <br>
                    *********
                </span>
                <div v-else>
                    <p v-for="(item, index) in valueList" :key="`channel-data-value-${index}`">
                        {{ item }}
                    </p>
                </div>
            </div>
            <p v-if="channelData.protocol_name === PROTOCOL_TYPE.SLACK">
                <info-message :message="$t('IDENTITY.USER.NOTIFICATION.CANNOT_EDIT_SLACK')" />
            </p>
            <button v-else class="edit-btn" :class="{'edit-disable':disableEdit}"
                    @click="startEdit(EDIT_TYPE.DATA)"
            >
                <p-i name="ic_edit" width="1rem" height="1rem"
                     color="inherit" class="edit-icon"
                />
                {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
            </button>
        </div>
    </li>
</template>

<script lang="ts">
import {
    PBadge, PButton, PI, PTextInput,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { useNotificationItem } from '@/views/identity/user/modules/notification/notification-channel-item/hooks';
import {
    EDIT_TYPE,
    PARAM_KEY_TYPE,
    PROTOCOL_TYPE,
} from '@/views/identity/user/modules/notification/notification-channel-item/type';
import AddNotificationMemberGroup from '@/views/identity/user/modules/notification/AddNotificationMemberGroup.vue';
import InfoMessage from '@/common/components/InfoMessage.vue';


export default {
    name: 'NotificationChannelItemData',
    components: {
        PButton,
        PI,
        PTextInput,
        PBadge,
        AddNotificationMemberGroup,
        InfoMessage,
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
            dataForEdit: props.channelData?.data,
        });
        const state = reactive({
            keyList: computed(() => Object.keys(notificationItemState.dataForEdit)),
            valueList: computed(() => Object.values(notificationItemState.dataForEdit)),
        });

        const saveChangedData = async () => {
            if (props.projectId) await updateProjectChannel(PARAM_KEY_TYPE.DATA, notificationItemState.dataForEdit);
            else await updateUserChannel(PARAM_KEY_TYPE.DATA, notificationItemState.dataForEdit);
        };

        const onClickSave = async () => {
            await saveChangedData();
            emit('change');
        };

        const onChangeUser = (value) => {
            notificationItemState.dataForEdit.users = value.users;
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
            onChangeUser,
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
