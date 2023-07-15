<script lang="ts" setup>
import {
    PBadge, PButton, PI, PJsonSchemaForm,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import InfoMessage from '@/common/components/guidance/InfoMessage.vue';

import type { ChannelItem } from '@/services/administration/iam/user/type';
import AddNotificationMemberGroup from '@/services/notification/modules/AddNotificationMemberGroup.vue';
import { useNotificationItem } from '@/services/notification/modules/notification-channel-item/composables';
import {
    EDIT_TYPE,
    PARAM_KEY_TYPE,
} from '@/services/notification/modules/notification-channel-item/type';

interface Props {
    channelData: ChannelItem;
    projectId: string;
    disableEdit: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'change'): void;
    (e: 'edit', value?: any): void;
}>();
const store = useStore();
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
    dataForEdit: cloneDeep(props.channelData?.data),
}, emit);
const state = reactive({
    keyListForEdit: [],
    keyListForRead: [],
    valueList: [],
    //
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
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
    else state.keyListForEdit = computed(() => Object.keys(props.channelData.data ?? {}).sort());
};

const setKeyListForRead = () => {
    if (props.channelData.secret_id) state.keyListForRead = computed(() => Object.keys(props.channelData.schema.properties).sort());
    else state.keyListForRead = computed(() => Object.keys(props.channelData.data ?? {}).sort());
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

const handleSchemaValidate = (isValid) => {
    state.isSchemaDataValid = isValid;
};

(async () => {
    await Promise.allSettled([
        setKeyListForEdit(), setKeyListForRead(), setValueList(),
        // LOAD REFERENCE STORE
        store.dispatch('reference/user/load'),
    ]);
})();

</script>

<template>
    <li class="content-wrapper"
        :class="{'edit-mode': state.isEditMode}"
    >
        <!-- Edit Mode of Left section(Key) -->
        <div v-if="state.isEditMode"
             class="content-title"
        >
            <p v-for="(item, index) in state.keyListForEdit"
               :key="`channel-data-key-${index}`"
            >
                {{ item.replace(/\_/g, ' ') }}
            </p>
        </div>

        <!-- Read Mode of Left section(Key) -->
        <div v-else
             class="content-title"
        >
            <span v-for="(item, index) in state.keyListForRead"
                  :key="`channel-data-key-${index}`"
            >
                {{ item.replace(/\_/g, ' ') }}
            </span>
        </div>

        <!-- Edit Mode of Content -->
        <div v-if="state.isEditMode"
             class="content"
        >
            <div class="left-section">
                <p v-if="state.isSpaceOneUserProtocol">
                    <add-notification-member-group :users="channelData.data.users"
                                                   :project-id="projectId"
                                                   @change="onChangeUser"
                    />
                </p>
                <div>
                    <p-json-schema-form
                        v-model:form-data="state.dataForEdit"
                        :schema="state.schema"
                        :language="$store.state.user.language"
                        class="schema-form"
                        @validate="handleSchemaValidate"
                    />
                </div>
            </div>
            <div class="button-group">
                <p-button style-type="secondary"
                          size="sm"
                          class="cancel-button"
                          @click="cancelEdit(channelData.data)"
                >
                    {{ t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          size="sm"
                          :disabled="!state.isSpaceOneUserProtocol && !state.isDataValid"
                          @click="onClickSave"
                >
                    {{ t('IDENTITY.USER.NOTIFICATION.FORM.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>

        <!-- Read Mode of Content -->
        <div v-else
             class="content"
        >
            <div class="left-section">
                <div v-if="state.isSpaceOneUserProtocol">
                    <p-badge v-for="(userId, index) in state.dataForEdit.users"
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
                <info-message :message="t('IDENTITY.USER.NOTIFICATION.CANNOT_EDIT_TOKEN')" />
            </p>
            <button v-else
                    class="edit-button"
                    :class="{'edit-disable':disableEdit}"
                    @click="startEdit(EDIT_TYPE.DATA, channelData.data)"
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
