<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldGroup, PTextInput, PJsonSchemaForm, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import { useNotificationProtocolApi } from '@/api-clients/alert-manager/notification-protocol/composables/use-notification-protocol-api';
import { useProtocolApi } from '@/api-clients/notification/protocol/composables/use-protocol-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-model/use-all-reference-data-model';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import type { NotificationLevel } from '@/schema/notification/notification/type';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import NotificationAddLevel from '@/services/my-page/components/NotificationAddLevel.vue';
import NotificationAddMemberGroup from '@/services/my-page/components/NotificationAddMemberGroup.vue';
import type { NotificationAddFormDataPayload } from '@/services/my-page/types/notification-add-form-type';


const SPACEONE_USER_CHANNEL_TYPE = 'SpaceONE User' as const;
const userStore = useUserStore();

const PROTOCOL_TYPE = {
    INTERNAL: 'INTERNAL',
    EXTERNAL: 'EXTERNAL',
} as const;

const props = withDefaults(defineProps<{
    projectId: string;
    protocolType: string;
    protocolId: string;
    visibleUserNotification: boolean;
}>(), {
    projectId: '',
    protocolType: '',
    protocolId: '',
    visibleUserNotification: false,
});
const emit = defineEmits<{(event: 'change', payload: NotificationAddFormDataPayload|{channelName: string; data: Record<string, any>}): void;
}>();

const referenceMap = useAllReferenceDataModel();
const storeState = reactive({
    language: computed<string|undefined>(() => userStore.state.language),
});
const state = reactive({
    protocol: computed(() => {
        if (!props.protocolId) return null;
        return referenceMap.protocol[props.protocolId] || null;
    }),
    channelName: undefined as string|undefined,
    notificationLevel: 'LV1' as NotificationLevel,
    schemaForm: {} as Record<string, any>,
    schema: computed<JsonSchema|null>(() => (props.visibleUserNotification
        ? notificationProtocolData.value?.plugin_info.metadata.data.schema ?? null
        : protocolData.value?.plugin_info.metadata.data.schema ?? null)),
    isSchemaFormValid: false,
    nameInvalidText: computed<TranslateResult|undefined>(() => {
        if (state.channelName !== undefined && state.channelName.length === 0) {
            return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
        }
        if (state.channelName !== undefined && state.channelName.length > 40) {
            return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_INVALID_TEXT');
        }
        return undefined;
    }),
    isNameInvalid: computed<boolean>(() => !!state.nameInvalidText),
    //
    isJsonSchema: computed<boolean>(() => (state.schema ? Object.keys(state.schema).length !== 0 : false)),
    isInputNotEmpty: computed<boolean>(() => state.channelName !== undefined && Object.keys(state.schemaForm).length !== 0),
    isInputValid: computed<boolean>(() => state.isInputNotEmpty && (state.isSchemaFormValid && !state.isNameInvalid)),
    isDataValid: computed<boolean>(() => (!state.isJsonSchema && !state.isNameInvalid) || (state.isJsonSchema && state.isInputValid)),
    selectedMember: ['*'] as string[],
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

const { notificationProtocolAPI } = useNotificationProtocolApi();
const { protocolAPI } = useProtocolApi();
const { key: notificationProtocolQueryKey, params: notificationProtocolQueryParams } = useServiceQueryKey('alert-manager', 'notification-protocol', 'get', {
    params: computed(() => ({
        protocol_id: props.protocolId,
    })),
});
const { key: protocolQueryKey, params: protocolQueryParams } = useServiceQueryKey('notification', 'protocol', 'get', {
    params: computed(() => ({
        protocol_id: props.protocolId,
    })),
});

const { data: notificationProtocolData } = useScopedQuery({
    queryKey: notificationProtocolQueryKey,
    queryFn: () => notificationProtocolAPI.get(notificationProtocolQueryParams.value),
    enabled: computed(() => props.visibleUserNotification && !!props.protocolId),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
}, ['USER']);
const { data: protocolData } = useScopedQuery({
    queryKey: protocolQueryKey,
    queryFn: () => protocolAPI.get(protocolQueryParams.value),
    enabled: computed(() => !props.visibleUserNotification && !!props.protocolId),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
}, ['USER']);

const emitChange = () => {
    emit('change', !props.visibleUserNotification ? {
        channelName: state.channelName,
        data: (props.protocolType === PROTOCOL_TYPE.EXTERNAL)
            ? state.schemaForm
            : { users: state.selectedMember },
        level: state.notificationLevel,
        isValid: state.isDataValid,
    } : {
        channelName: state.channelName,
        data: state.schemaForm,
        isValid: state.isInputValid,
    });
};

const onChangeChannelName = (value: string) => {
    state.channelName = value;
    emitChange();
};

const handleSchemaFormChange = (isValid, form) => {
    state.isSchemaFormValid = isValid;
    state.schemaForm = form;
    emitChange();
};

const onChangeMember = (member) => {
    if (state.selectedRadioIdx === 1) {
        state.selectedMember = member;
    } else {
        state.selectedMember = ['*'];
    }
    emitChange();
};

const onChangeLevel = (level: NotificationLevel) => {
    state.notificationLevel = level;
    emitChange();
};

const initStates = () => {
    state.channelName = undefined;
    state.notificationLevel = 'LV1';
    state.schemaForm = {};
    state.isSchemaFormValid = false;
    state.selectedMember = ['*'];
};

watch(() => props.protocolId, async (protocolId) => {
    if (!protocolId) return;
    initStates();
}, { immediate: true });
</script>

<template>
    <div class="notification-add-form-data">
        <p-field-group
            :label="$t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME')"
            required
            :invalid-text="state.nameInvalidText"
            :invalid="state.isNameInvalid"
            class="base-info-input"
        >
            <template #default>
                <p-text-input :value="state.channelName"
                              class="block w-full"
                              :invalid="state.isNameInvalid"
                              :placeholder="$t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME')"
                              @update:value="onChangeChannelName"
                />
            </template>
        </p-field-group>
        <notification-add-level v-if="props.projectId"
                                @change="onChangeLevel"
        />
        <p-json-schema-form v-if="state.isJsonSchema"
                            :key="props.protocolId"
                            :form-data="state.schemaForm"
                            :schema="state.schema"
                            :language="storeState.language"
                            class="schema-form"
                            @change="handleSchemaFormChange"
        />
        <div v-if="props.projectId && state.protocol?.name === SPACEONE_USER_CHANNEL_TYPE && props.protocolType === PROTOCOL_TYPE.INTERNAL">
            <p-field-group :label="$t('IAM.USER.FORM.MEMBER')"
                           required
            >
                <template #default>
                    <p-radio-group>
                        <p-radio v-for="(item, idx) in state.radioMenuList"
                                 :key="idx"
                                 v-model="state.selectedRadioIdx"
                                 :value="idx"
                                 @change="onChangeMember"
                        >
                            <span class="radio-item">
                                {{ item.label }}
                            </span>
                        </p-radio>
                    </p-radio-group>
                    <notification-add-member-group v-if="state.selectedRadioIdx === 1"
                                                   :project-id="props.projectId"
                                                   @change="onChangeMember"
                    />
                </template>
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.notification-add-form-data {
    .base-info-input {
        max-width: 30rem;
        margin-top: 1.25rem;
    }

    .radio-item {
        @apply flex items-center;
        margin-left: 0.25rem;
        gap: 0.25rem;
    }

    /* custom design-system component - p-radio */
    :deep(.p-radio) {
        @apply inline-flex items-center;
    }

    /* custom design-system component - p-json-schema-form */
    :deep(.p-json-schema-form) {
        .p-text-input {
            width: 100%;
            max-width: 30rem;
        }
    }
}
</style>
