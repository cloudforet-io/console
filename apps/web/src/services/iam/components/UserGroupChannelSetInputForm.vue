<script lang="ts" setup>
import { onMounted, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { NotificationProtocolGetParameters } from '@/api-clients/alert-manager/notification-protocol/schema/api-verbs/get';
import type { NotificationProtocolModel } from '@/api-clients/alert-manager/notification-protocol/schema/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import UserGroupChannelAddFormData from '@/services/iam/components/UserGroupChannelAddFormData.vue';
import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const emit = defineEmits(['update-valid', 'update-channel-name']);

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

interface ChannelInfo {
  channelName: string;
  channelData: Record<string, any>
  channelInput: any;
  selectedProtocolData: any;
}

interface UserModeInfo {
  userMode: MenuItem;
  users: MenuItem[]
}

const state = reactive<ChannelInfo & UserModeInfo>({
    channelName: '',
    channelData: {},
    channelInput: {},
    selectedProtocolData: {},
    userMode: {},
    users: [],
});

const validateState = reactive({
    schemaValid: false,
});

const {
    forms: {
        channelName,
    },
    setForm,
    invalidState,
} = useFormValidator({
    channelName: userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE') ? '' : notificationChannelCreateFormState.channelName,
}, {
    channelName(value: string) {
        if (!value) return ' ';
        if (value.length >= 40) {
            return i18n.t('ALERT_MANAGER.NOTIFICATIONS.NAME_INVALID_TEXT');
        }
        return '';
    },
});

/* Component */
const handleUpdateValid = (value: boolean) => {
    validateState.schemaValid = value;
};

/* Watcher */
watch(() => channelName, (nv_channel_name) => {
    if (nv_channel_name) {
        emit('update-channel-name', nv_channel_name);
    }
}, { immediate: true });

watch(() => state.selectedProtocolData, (nv_selected_protocol_data) => {
    if (nv_selected_protocol_data) {
        const { schema } = nv_selected_protocol_data.plugin_info.metadata.data;
        state.channelData = schema.properties;
        //     store value. (not using both of them - will be deprecated one of them later)
        notificationChannelCreateFormStore.$patch((_state) => {
            _state.state.protocolSchemaForm = schema.properties;
        });
    }
});

watch(() => state.channelData, (nv_channel_data) => {
    if (nv_channel_data) {
        state.channelInput = Object.keys(nv_channel_data);
    }
}, { deep: true, immediate: true });

watch(() => validateState, (nv_validate_state) => {
    if (nv_validate_state.schemaValid && invalidState) {
        emit('update-valid', true);
    } else {
        emit('update-valid', false);
    }
}, { deep: true, immediate: true });

/* API */
const fetchGetNotificationProtocol = async (params: NotificationProtocolGetParameters) => {
    try {
        state.selectedProtocolData = await SpaceConnector.clientV2.alertManager.notificationProtocol.get<NotificationProtocolGetParameters, NotificationProtocolModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

/* Mounted */
onMounted(async () => {
    if (notificationChannelCreateFormState.selectedProtocol) {
        await fetchGetNotificationProtocol({
            protocol_id: notificationChannelCreateFormState.selectedProtocol.protocol_id,
        });
    }
});
</script>

<template>
    <div class="flex flex-col bg-white">
        <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.CHANNEL_NAME')"
                       required
                       :invalid="!invalidState.channelName"
        >
            <template #default="{invalid}">
                <p-text-input block
                              :value="channelName"
                              :invalid="!invalid"
                              @update:value="setForm('channelName', $event)"
                />
            </template>
        </p-field-group>
        <user-group-channel-add-form-data v-if="userGroupPageState.modal.title === $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE')"
                                          @update-valid="handleUpdateValid"
        />
    </div>
</template>
