<template>
    <div>
        <p-field-group
            :label="$t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME')"
            required
            :invalid-text="nameInvalidText"
            :invalid="isNameInvalid"
            class="base-info-input"
        >
            <template #default>
                <p-text-input v-model="channelName"
                              class="block w-full"
                              :invalid="isNameInvalid"
                              :placeholder="$t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME')"
                              @update:value="onChangeChannelName"
                />
            </template>
        </p-field-group>
        <add-notification-level v-if="projectId"
                                @change="onChangeLevel"
        />
        <p-json-schema-form v-if="isJsonSchema"
                            :key="protocolId"
                            :form-data="schemaForm"
                            :schema="schema"
                            :language="$store.state.user.language"
                            class="schema-form"
                            @change="handleSchemaFormChange"
        />
        <div v-if="projectId && protocol === CHANNEL_TYPE.SPACEONE_USER && protocolType === PROTOCOL_TYPE.INTERNAL">
            <p-field-group :label="$t('MENU.ADMINISTRATION_USER')"
                           required
            >
                <template #default>
                    <add-notification-member-group :project-id="projectId"
                                                   @change="onChangeMember"
                    />
                </template>
            </p-field-group>
        </div>
    </div>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PFieldGroup, PTextInput, PJsonSchemaForm,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AddNotificationLevel from '@/services/notification/modules/AddNotificationLevel.vue';
import AddNotificationMemberGroup from '@/services/notification/modules/AddNotificationMemberGroup.vue';

const CHANNEL_TYPE = {
    AWS_SNS: 'AWSSNS',
    SLACK: 'Slack',
    SPACEONE_USER: 'SpaceONEUser',
} as const;
// type ChannelType = typeof CHANNEL_TYPE[keyof typeof CHANNEL_TYPE];

const PROTOCOL_TYPE = {
    INTERNAL: 'INTERNAL',
    EXTERNAL: 'EXTERNAL',
} as const;
// type ProtocolType = typeof PROTOCOL_TYPE[keyof typeof PROTOCOL_TYPE];

export default {
    name: 'AddNotificationData',
    components: {
        AddNotificationLevel,
        AddNotificationMemberGroup,
        PFieldGroup,
        PTextInput,
        PJsonSchemaForm,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
        supportedSchema: {
            type: [String, Array],
            default: null,
        },
        protocolType: {
            type: String,
            default: '',
        },
        protocolId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const protocol = vm.$route.params.protocol;

        const state = reactive({
            channelName: undefined,
            notificationLevel: 'LV1',
            schemaForm: {},
            schema: null as null|object,
            isSchemaFormValid: false,
            nameInvalidText: computed(() => {
                if (state.channelName !== undefined && state.channelName.length === 0) {
                    return vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
                }
                if (state.channelName !== undefined && state.channelName.length > 40) {
                    return vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_INVALID_TEXT');
                }
                return undefined;
            }),
            isNameInvalid: computed(() => !!state.nameInvalidText),
            //
            isJsonSchema: computed(() => (state.schema ? Object.keys(state.schema).length !== 0 : false)),
            isInputNotEmpty: computed(() => state.channelName !== undefined && Object.keys(state.schemaForm).length !== 0),
            isInputValid: computed(() => state.isInputNotEmpty && (state.isSchemaFormValid && !state.isNameInvalid)),
            isDataValid: computed(() => (!state.isJsonSchema && !state.isNameInvalid) || (state.isJsonSchema && state.isInputValid)),
            selectedMember: [],
        });

        const apiQuery = new ApiQueryHelper();
        const getSchema = async (): Promise<object|null> => {
            try {
                apiQuery.setFilters([{ k: 'protocol_id', v: props.protocolId, o: '=' }]);
                const res = await SpaceConnector.client.notification.protocol.list({
                    query: apiQuery.data,
                });
                return res.results[0]?.plugin_info.metadata.data.schema ?? {};
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

        const onChangeChannelName = (value) => {
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

        const onChangeLevel = (value) => {
            state.notificationLevel = value.level;
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

        watch([() => props.protocolId, () => props.supportedSchema, () => props.protocolType], async ([protocolId, supportedSchema, protocolType]) => {
            if (!protocolId) return;
            initStates();
            if (!supportedSchema || protocolType !== PROTOCOL_TYPE.EXTERNAL) return;
            state.schema = await getSchema();
        }, { immediate: true });

        return {
            protocol,
            CHANNEL_TYPE,
            PROTOCOL_TYPE,
            ...toRefs(state),
            onChangeChannelName,
            handleSchemaFormChange,
            onChangeMember,
            onChangeLevel,
        };
    },

};
</script>

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
