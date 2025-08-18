<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { ComputedRef } from 'vue';

import {
    PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import { useNotificationProtocolApi } from '@/api-clients/alert-manager/notification-protocol/composables/use-notification-protocol-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import UserGroupChannelAddFormData from '@/services/iam/components/UserGroupChannelAddFormData.vue';
import { useUserGroupChannelGetQuery } from '@/services/iam/composables/use-user-group-channel-get-query';
import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const emit = defineEmits(['update-valid', 'update-channel-name']);

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

interface ChannelInfo {
  channelName: string;
  schema: ComputedRef<JsonSchema>;
  channelData: ComputedRef<Record<string, JsonSchema>>;
  channelInput: any;
}

interface UserModeInfo {
  userMode: MenuItem;
  users: MenuItem[]
}

const protocolId = computed<string>(() => notificationChannelCreateFormState.selectedProtocol.protocol_id);

const { notificationProtocolAPI } = useNotificationProtocolApi();

const { key: notificationProtocolQueryKey, params: notificationProtocolQueryParams } = useServiceQueryKey('alert-manager', 'notification-protocol', 'get', {
    params: computed(() => ({
        protocol_id: protocolId.value,
    })),
});


const { userGroupChannelData } = useUserGroupChannelGetQuery();

const { data: notificationProtocolData } = useScopedQuery({
    queryKey: notificationProtocolQueryKey,
    queryFn: () => notificationProtocolAPI.get(notificationProtocolQueryParams.value),
    enabled: computed(() => !!protocolId.value),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
}, ['DOMAIN', 'WORKSPACE']);

const state = reactive<ChannelInfo & UserModeInfo>({
    channelName: '',
    schema: computed(() => notificationProtocolData.value?.plugin_info.metadata.data.schema ?? {}),
    channelData: computed(() => state.schema.properties || {}),
    channelInput: {},
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
    channelName: '',
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
watch(
    () => userGroupChannelData.value?.name,
    (name) => {
        const isCreate = userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE');
        if (!isCreate) setForm('channelName', name ?? '');
    },
    { immediate: true },
);
const handleUpdateValid = (value: boolean) => {
    validateState.schemaValid = value;
};

/* Watcher */
watch(channelName, (nv_channel_name) => {
    if (nv_channel_name) {
        emit('update-channel-name', nv_channel_name);
    }
}, { immediate: true });

watch(() => state.channelData, (nv_channel_data) => {
    if (nv_channel_data) {
        state.channelInput = Object.keys(nv_channel_data);
        //     store value. (not using both of them - will be deprecated one of them later)
        notificationChannelCreateFormStore.$patch((_state) => {
            _state.state.protocolSchemaForm = nv_channel_data;
        });
    }
}, { deep: true, immediate: true });

watch(() => validateState, (nv_validate_state) => {
    if (nv_validate_state.schemaValid && invalidState) {
        emit('update-valid', true);
    } else {
        emit('update-valid', false);
    }
}, { deep: true, immediate: true });
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
                                          :schema="state.schema"
                                          @update-valid="handleUpdateValid"
        />
    </div>
</template>
