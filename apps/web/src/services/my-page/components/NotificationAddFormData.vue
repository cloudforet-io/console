<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PFieldGroup, PTextInput, PJsonSchemaForm, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NotificationProtocolListParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/list';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { NotificationLevel } from '@/schema/notification/notification/type';
import type { ProtocolListParameters } from '@/schema/notification/protocol/api-verbs/list';
import type { ProtocolModel } from '@/schema/notification/protocol/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProtocolReferenceMap } from '@/store/reference/protocol-reference-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import NotificationAddLevel from '@/services/my-page/components/NotificationAddLevel.vue';
import NotificationAddMemberGroup from '@/services/my-page/components/NotificationAddMemberGroup.vue';
import type { NotificationAddFormDataPayload } from '@/services/my-page/types/notification-add-form-type';

const SPACEONE_USER_CHANNEL_TYPE = 'SpaceONE User' as const;
const allReferenceStore = useAllReferenceStore();
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

const storeState = reactive({
    protocols: computed<ProtocolReferenceMap>(() => allReferenceStore.getters.protocol),
    language: computed<string|undefined>(() => userStore.state.language),
});
const state = reactive({
    protocol: computed(() => storeState.protocols[props.protocolId] ?? null),
    channelName: undefined as string|undefined,
    notificationLevel: 'LV1' as NotificationLevel,
    schemaForm: {} as Record<string, any>,
    schema: null as null|JsonSchema,
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

const apiQuery = new ApiQueryHelper();
const getSchema = async (): Promise<JsonSchema|null> => {
    try {
        apiQuery.setFilters([{ k: 'protocol_id', v: props.protocolId, o: '=' }]);
        const fetcher = props.visibleUserNotification
            ? SpaceConnector.clientV2.alertManager.notificationProtocol.list<NotificationProtocolListParameters, ListResponse<NotificationProtocolModel>>
            : SpaceConnector.clientV2.notification.protocol.list<ProtocolListParameters, ListResponse<ProtocolModel>>;
        const res = await fetcher({
            query: apiQuery.data,
        });
        return res.results?.[0]?.plugin_info.metadata.data.schema ?? {};
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};

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
    state.schema = null;
};

watch([() => props.protocolId, () => props.protocolType], async ([protocolId, protocolType]) => {
    if (!protocolId) return;
    initStates();
    if (!props.visibleUserNotification && protocolType !== PROTOCOL_TYPE.EXTERNAL) return;
    state.schema = await getSchema();
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
