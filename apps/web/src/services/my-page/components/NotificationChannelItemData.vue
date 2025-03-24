<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { cloneDeep } from 'lodash';

import {
    PBadge, PButton, PI, PJsonSchemaForm, PRadio, PRadioGroup,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import InfoMessage from '@/common/components/guidance/InfoMessage.vue';

import NotificationAddMemberGroup from '@/services/my-page/components/NotificationAddMemberGroup.vue';
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
    (event: 'edit', value?: Record<string, any>): void;
}>();

const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();

const {
    state: notificationItemState,
    cancelEdit,
    startEdit,
    updateUserChannel,
    updateProjectChannel,
} = useNotificationItem<Record<string, any>>({
    userChannelId: props.visibleUserNotification ? props.channelData.channel_id : props.channelData.user_channel_id,
    projectChannelId: props.channelData.project_channel_id,
    isEditMode: false,
    dataForEdit: cloneDeep(props.channelData.data),
}, emit);
const state = reactive({
    keyListForEdit: [],
    keyListForRead: [],
    valueList: [],
    //
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    language: computed<string|undefined>(() => userStore.state.language),
    schema: props.channelData.schema,
    isSecretData: computed<boolean>(() => !!props.channelData.secret_id),
    isSpaceOneUserProtocol: computed<boolean>(() => state.keyListForEdit.includes('users')),
    isAllUsers: computed<boolean>(() => props.channelData.data.users.some((i) => i === '*')),
    //
    isSchemaDataValid: false,
    isJsonSchema: computed(() => Object.keys(state.schema).length !== 0),
    isInputValid: computed(() => state.isSchemaDataValid),
    isDataValid: computed(() => state.isJsonSchema && state.isInputValid),
    radioMenuList: computed<MenuItem[]>(() => [
        {
            label: i18n.t('PROJECT.DETAIL.NOTIFICATION_ALL_USERS'),
            name: 'all',
        },
        {
            label: i18n.t('PROJECT.DETAIL.WORKSPACE_MEMBER'),
            name: 'specific',
        },
    ]),
    selectedRadioIdx: 0,
});

const setKeyListForEdit = () => {
    const hasSchema = !!Object.keys(props.channelData.schema).length;
    if (hasSchema) state.keyListForEdit = computed(() => Object.keys(props.channelData.schema.properties ?? {}).sort());
    else state.keyListForEdit = computed(() => Object.keys(props.channelData.data ?? {}).sort());
};

const setKeyListForRead = () => {
    if (props.channelData.secret_id) state.keyListForRead = computed(() => Object.keys(props.channelData.schema.properties ?? {}).sort());
    else state.keyListForRead = computed(() => Object.keys(props.channelData.data ?? {}).sort());
};

const setValueList = () => {
    const dataForEdit = notificationItemState.dataForEdit;
    if (!dataForEdit) return;
    Object.keys(dataForEdit).sort().forEach((key) => {
        state.valueList[key] = dataForEdit[key];
    });
};

const saveChangedData = async () => {
    if (!props.visibleUserNotification && props.projectId) await updateProjectChannel('data', notificationItemState.dataForEdit);
    else await updateUserChannel('data', notificationItemState.dataForEdit);
    setValueList();
};

const onClickSave = async () => {
    await saveChangedData();
    emit('change');
};

const onChangeUser = (value: Record<string, any>) => {
    if (!notificationItemState.dataForEdit) return;
    if (state.selectedRadioIdx === 1) {
        notificationItemState.dataForEdit.users = value;
    } else {
        notificationItemState.dataForEdit.users = ['*'];
    }
};

const handleSchemaValidate = (isValid: boolean) => {
    state.isSchemaDataValid = isValid;
};

watch(() => notificationItemState.isEditMode, (mode) => {
    if (!mode) return;
    if (!state.isAllUsers) {
        state.selectedRadioIdx = 1;
    }
});

(async () => {
    await Promise.allSettled([setKeyListForEdit(), setKeyListForRead(), setValueList()]);
})();
</script>

<template>
    <li class="content-wrapper"
        :class="{'edit-mode': notificationItemState.isEditMode}"
    >
        <!-- Edit Mode of Left section(Key) -->
        <div v-if="notificationItemState.isEditMode"
             class="content-title"
        >
            <p v-for="(item, index) in state.keyListForEdit"
               :key="`channel-data-key-${index}`"
            >
                {{ state.isSpaceOneUserProtocol ? $t('IAM.USER.FORM.MEMBER') : item.replace(/\_/g, ' ') }}
            </p>
        </div>

        <!-- Read Mode of Left section(Key) -->
        <div v-else
             class="content-title"
        >
            <span v-for="(item, index) in state.keyListForRead"
                  :key="`channel-data-key-${index}`"
            >
                {{ state.isSpaceOneUserProtocol ? $t('IAM.USER.FORM.MEMBER') : item.replace(/\_/g, ' ') }}
            </span>
        </div>

        <!-- Edit Mode of Content -->
        <div v-if="notificationItemState.isEditMode"
             class="content"
        >
            <div class="left-section">
                <p v-if="state.isSpaceOneUserProtocol">
                    <p-radio-group>
                        <p-radio v-for="(item, idx) in state.radioMenuList"
                                 :key="idx"
                                 v-model="state.selectedRadioIdx"
                                 :value="idx"
                                 @change="onChangeUser"
                        >
                            <span class="radio-item">
                                {{ item.label }}
                            </span>
                        </p-radio>
                    </p-radio-group>
                    <notification-add-member-group v-if="state.selectedRadioIdx === 1"
                                                   :users="state.isAllUsers ? [] : props.channelData.data.users"
                                                   :project-id="props.projectId"
                                                   @change="onChangeUser"
                    />
                </p>
                <div>
                    <p-json-schema-form
                        :form-data.sync="notificationItemState.dataForEdit"
                        :schema="state.schema"
                        :language="state.language"
                        class="schema-form"
                        @validate="handleSchemaValidate"
                    />
                </div>
            </div>
            <div class="button-group">
                <p-button style-type="secondary"
                          size="sm"
                          class="cancel-button"
                          @click="cancelEdit(props.channelData.data)"
                >
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          size="sm"
                          :disabled="!state.isSpaceOneUserProtocol && !state.isDataValid"
                          @click="onClickSave"
                >
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>

        <!-- Read Mode of Content -->
        <div v-else
             class="content"
        >
            <div class="left-section">
                <div v-if="state.isSpaceOneUserProtocol">
                    <span v-if="notificationItemState.dataForEdit?.users?.includes('*')">
                        {{ $t('PROJECT.DETAIL.NOTIFICATION_ALL_USERS') }}
                    </span>
                    <p-badge v-for="(userId, index) in notificationItemState.dataForEdit?.users"
                             v-else
                             :key="`users-${index}`"
                             badge-type="subtle"
                             style-type="gray200"
                             shape="square"
                             class="mr-2 rounded"
                    >
                        {{ state.users[userId] ? state.users[userId].label : userId }}
                    </p-badge>
                </div>
                <div v-else-if="state.isSecretData"
                     class="inline"
                >
                    <span v-for="(item, index) in state.keyListForRead"
                          :key="`channel-secret-data-key-${index}`"
                    >*********</span>
                </div>
                <div v-else>
                    <p v-for="(item, index) in Object.values(state.valueList)"
                       :key="`channel-data-value-${index}`"
                    >
                        {{ item }}
                    </p>
                </div>
            </div>
            <p v-if="state.isSecretData">
                <info-message :message="$t('MY_PAGE.NOTIFICATION.CANNOT_EDIT_TOKEN')" />
            </p>
            <button v-else
                    class="edit-button"
                    :class="{'edit-disable': props.disableEdit}"
                    @click="startEdit('data', props.channelData.data)"
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
.content-wrapper {
    .edit-button {
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

    /* custom design-system component - p-radio */
    :deep(.p-radio) {
        @apply inline-flex items-center;
        .radio-item {
            @apply flex items-center;
            margin-left: 0.25rem;
            gap: 0.25rem;
        }
    }
}

/* custom design-system component - p-json-schema-form */
:deep(.p-json-schema-form.schema-form) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    .label-box {
        display: none;
    }
    .json-schema-field-group {
        margin-bottom: 0;
    }
    .p-field-group:last-of-type {
        margin-bottom: 0;
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    .label-box {
        display: none;
    }
}
</style>
