<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/types/composables';

import {
    PFieldGroup, PTextInput, PJsonSchemaForm,
} from '@spaceone/design-system';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { NotificationLevel } from '@/schema/notification/notification/type';
import type { ProtocolListParameters } from '@/schema/notification/protocol/api-verbs/list';
import type { ProtocolModel } from '@/schema/notification/protocol/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import NotificationAddLevel from '@/services/my-page/components/NotificationAddLevel.vue';
import NotificationAddMemberGroup from '@/services/my-page/components/NotificationAddMemberGroup.vue';
import type { NotificationAddFormDataPayload } from '@/services/my-page/types/notification-add-form-type';


const CHANNEL_TYPE = {
    AWS_SNS: 'AWSSNS',
    SLACK: 'Slack',
    SPACEONE_USER: 'SpaceONEUser',
} as const;

const PROTOCOL_TYPE = {
    INTERNAL: 'INTERNAL',
    EXTERNAL: 'EXTERNAL',
} as const;

const props = withDefaults(defineProps<{
    projectId: string;
    protocolType: string;
    protocolId: string;
}>(), {
    projectId: '',
    protocolType: '',
    protocolId: '',
});
const emit = defineEmits<{(event: 'change', payload: NotificationAddFormDataPayload): void;
}>();

const route = useRoute();

const state = reactive({
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
    selectedMember: [] as string[],
});

const apiQuery = new ApiQueryHelper();
const getSchema = async (): Promise<JsonSchema|null> => {
    try {
        apiQuery.setFilters([{ k: 'protocol_id', v: props.protocolId, o: '=' }]);
        const res = await SpaceConnector.clientV2.notification.protocol.list<ProtocolListParameters, ListResponse<ProtocolModel>>({
            query: apiQuery.data,
        });
        return res.results?.[0]?.plugin_info.metadata.data.schema ?? {};
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};

const emitChange = () => {
    emit('change', {
        channelName: state.channelName,
        data: (props.protocolType === PROTOCOL_TYPE.EXTERNAL) ? state.schemaForm : { users: state.selectedMember },
        level: state.notificationLevel,
        isValid: state.isDataValid,
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

const onChangeMember = (value) => {
    state.selectedMember = value.users;
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
    state.selectedMember = [];
    state.schema = null;
};

watch([() => props.protocolId, () => props.protocolType], async ([protocolId, protocolType]) => {
    if (!protocolId) return;
    initStates();
    if (protocolType !== PROTOCOL_TYPE.EXTERNAL) return;
    state.schema = await getSchema();
}, { immediate: true });
</script>

<template>
    <div>
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
                            :language="$store.state.user.language"
                            class="schema-form"
                            @change="handleSchemaFormChange"
        />
        <div v-if="props.projectId && route.params.protocol === CHANNEL_TYPE.SPACEONE_USER && props.protocolType === PROTOCOL_TYPE.INTERNAL">
            <p-field-group :label="$t('MENU.ADMINISTRATION_USER')"
                           required
            >
                <template #default>
                    <notification-add-member-group :project-id="props.projectId"
                                                   @change="onChangeMember"
                    />
                </template>
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.base-info-input {
    max-width: 30rem;
    margin-top: 1.25rem;
}

/* custom design-system component - p-json-schema-form */
:deep(.p-json-schema-form) {
    .p-text-input {
        width: 100%;
        max-width: 30rem;
    }
}
</style>
