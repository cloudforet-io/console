<template>
    <li class="content-wrapper" :class="{'edit-mode': isEditMode}">
        <!-- Edit Mode of Left section(Key) -->
        <div v-if="isEditMode" class="content-title">
            <p v-for="(item, index) in keyListForEdit" :key="`channel-data-key-${index}`">
                {{ item.replace(/\_/g, ' ') }}
            </p>
        </div>

        <!-- Read Mode of Left section(Key) -->
        <div v-else class="content-title">
            <p v-for="(item, index) in keyListForRead" :key="`channel-data-key-${index}`">
                {{ item.replace(/\_/g, ' ') }}
            </p>
        </div>

        <!-- Edit Mode of Content -->
        <div v-if="isEditMode" class="content">
            <div class="left-section">
                <p v-if="isSpaceOneUserProtocol">
                    <add-notification-member-group :users="channelData.data.users" :project-id="projectId" @change="onChangeUser" />
                </p>
                <div>
                    <p-json-schema-form
                        :model.sync="dataForEdit" :schema="schema" :is-valid.sync="isSchemaDataValid"
                        class="schema-form"
                    />
                </div>
            </div>
            <div class="button-group">
                <p-button :outline="true" size="sm" class="cancel-button"
                          @click="cancelEdit(channelData.data)"
                >
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button
                    style-type="primary"
                    size="sm"
                    :disabled="!isSpaceOneUserProtocol && !isDataValid"
                    @click="onClickSave"
                >
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>

        <!-- Read Mode of Content -->
        <div v-else class="content">
            <div class="left-section">
                <div v-if="isSpaceOneUserProtocol">
                    <p-badge v-for="(userId, index) in dataForEdit.users" :key="`users-${index}`"
                             style-type="gray200" shape="square"
                             class="mr-2 rounded"
                    >
                        {{ userItems[userId] ? userItems[userId].label : userId }}
                    </p-badge>
                </div>
                <div v-else-if="isSecretData" class="inline">
                    <p v-for="(item, index) in keyListForRead" :key="`channel-secret-data-key-${index}`">
                        *********
                    </p>
                </div>
                <div v-else>
                    <p v-for="(item, index) in Object.values(valueList)" :key="`channel-data-value-${index}`">
                        {{ item }}
                    </p>
                </div>
            </div>
            <p v-if="isSecretData">
                <info-message :message="$t('IDENTITY.USER.NOTIFICATION.CANNOT_EDIT_TOKEN')" />
            </p>
            <button v-else class="edit-btn" :class="{'edit-disable':disableEdit}"
                    @click="startEdit(EDIT_TYPE.DATA, channelData.data)"
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
    PBadge, PButton, PI, PJsonSchemaForm,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { cloneDeep } from 'lodash';
import { useNotificationItem } from '@/services/notification/modules/notification-channel-item/composables';
import {
    EDIT_TYPE,
    PARAM_KEY_TYPE,
    PROTOCOL_TYPE,
} from '@/services/notification/modules/notification-channel-item/type';
import AddNotificationMemberGroup from '@/services/notification/modules/AddNotificationMemberGroup.vue';
import InfoMessage from '@/common/components/guidance/InfoMessage.vue';
import { store } from '@/store';


export default {
    name: 'NotificationChannelItemData',
    components: {
        PButton,
        PI,
        PBadge,
        PJsonSchemaForm,
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
            dataForEdit: cloneDeep(props.channelData?.data),
        });
        const state = reactive({
            keyListForEdit: [],
            keyListForRead: [],
            valueList: [],
            //
            userItems: computed(() => store.state.resource.user.items),
            schema: props.channelData?.schema,
            isSecretData: computed(() => props.channelData?.secret_id.length > 0),
            isSpaceOneUserProtocol: computed(() => state.keyListForEdit.includes('users')),
            //
            isSchemaDataValid: false,
            isJsonSchema: computed(() => Object.keys(state.schema).length !== 0),
            isInputValid: computed(() => state.isSchemaDataValid),
            isDataValid: computed(() => state.isJsonSchema && state.isInputValid),
        });

        const setKeyListForEdit = () => {
            const hasSchema = !!Object.keys(props.channelData.schema).length;
            if (hasSchema) state.keyListForEdit = computed(() => Object.keys(props.channelData.schema.properties).sort());
            else state.keyListForEdit = computed(() => Object.keys(props.channelData?.data).sort());
        };

        const setKeyListForRead = () => {
            if (props.channelData.secret_id) state.keyListForRead = computed(() => Object.keys(props.channelData.schema.properties).sort());
            else state.keyListForRead = computed(() => Object.keys(props.channelData?.data).sort());
        };

        const setValueList = () => {
            Object.keys(notificationItemState.dataForEdit).sort().forEach((key) => {
                state.valueList[key] = notificationItemState.dataForEdit[key];
            });
        };

        const saveChangedData = async () => {
            if (props.projectId) await updateProjectChannel(PARAM_KEY_TYPE.DATA, notificationItemState.dataForEdit);
            else await updateUserChannel(PARAM_KEY_TYPE.DATA, notificationItemState.dataForEdit);
            setValueList();
        };

        const onClickSave = async () => {
            await saveChangedData();
            emit('change');
        };

        const onChangeUser = (value) => {
            notificationItemState.dataForEdit.users = value.users;
        };

        (async () => {
            await Promise.all([setKeyListForEdit(), setKeyListForRead(), setValueList()]);
        })();

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
@import '../styles/channelItem.pcss';
.content-wrapper::v-deep .edit-btn {
    &.edit-disable {
        @apply text-gray-300 cursor-not-allowed;
        &:active {
            @apply pointer-events-none;
        }
    }
}
.p-json-schema-form::v-deep {
    &.schema-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .label-box {
        display: none;
    }
    .json-schema-field-group {
        margin-bottom: 0;
    }
}
.p-field-group::v-deep {
    .label-box {
        display: none;
    }
}
</style>
