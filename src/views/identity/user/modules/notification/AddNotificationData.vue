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
                <p-text-input v-model="channelName" class="block w-full" :invalid="isNameInvalid"
                              :placeholder="$t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME')" @input="onChangeChannelName"
                />
            </template>
        </p-field-group>
        <add-notification-level v-if="projectId" @change="onChangeLevel" />
        <p-json-schema-form
            :model="schemaModel" :schema="schema" :is-valid.sync="isSchemaModelValid"
            @update:model="onChangeModel"
        />
        <div v-if="projectId && protocol === CHANNEL_TYPE.SPACEONE_USER">
            <add-notification-member-group :project-id="projectId" @change="onChangeMember" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    PFieldGroup, PPaneLayout, PSelectDropdown, PTextInput, PJsonSchemaForm, PTag,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
// eslint-disable-next-line import/named
import { notiChannelPhoneNumRegex } from '@/views/identity/user/lib/validations';
import AddNotificationLevel from '@/views/identity/user/modules/notification/AddNotificationLevel.vue';
import AddNotificationMemberGroup from '@/views/identity/user/modules/notification/AddNotificationMemberGroup.vue';
import { SpaceConnector } from '@/lib/space-connector';

const CHANNEL_TYPE = {
    AWS_SNS: 'AWSSNS',
    SLACK: 'Slack',
    SPACEONE_USER: 'SpaceONEUser',
} as const;
type CHANNEL_TYPE = typeof CHANNEL_TYPE[keyof typeof CHANNEL_TYPE];

const PROTOCOL_TYPE = {
    INTERNAL: 'INTERNAL',
    EXTERNAL: 'EXTERNAL',
} as const;
type PROTOCOL_TYPE = typeof PROTOCOL_TYPE[keyof typeof PROTOCOL_TYPE];

export default {
    name: 'AddNotificationData',
    components: {
        AddNotificationLevel,
        AddNotificationMemberGroup,
        PPaneLayout,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
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
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const protocol = vm.$route.params.protocol;

        const state = reactive({
            channelName: undefined,
            notificationLevel: '',
            schemaModel: {},
            schema: {},
            isSchemaModelValid: false,
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
            isJsonSchema: computed(() => Object.keys(state.schema).length !== 0),
            isInputNotEmpty: computed(() => state.channelName !== undefined && Object.keys(state.schemaModel).length !== 0),
            isInputValid: computed(() => state.isInputNotEmpty && (state.isSchemaModelValid && !state.isNameInvalid)),
            isDataValid: computed(() => (!state.isJsonSchema && !state.isNameInvalid) || (state.isJsonSchema && state.isInputValid)),
            selectedMember: [],
        });

        const getSchema = async () => {
            try {
                const res = await SpaceConnector.client.repository.schema.get({
                    name: props.supportedSchema,
                });
                state.schema = res.schema;
            } catch (e) {
                state.schema = {};
                console.error(e);
            }
        };

        const emitChange = () => {
            emit('change', {
                channelName: state.channelName,
                data: (props.protocolType === PROTOCOL_TYPE.EXTERNAL) ? state.schemaModel : { users: state.selectedMember },
                level: state.notificationLevel,
                isValid: state.isDataValid,
            });
        };

        const onChangeChannelName = (value) => {
            state.channelName = value;
            emitChange();
        };

        const onChangeModel = (value) => {
            state.schemaModel = value;
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

        (async () => {
            if (props.supportedSchema && props.protocolType === PROTOCOL_TYPE.EXTERNAL) await getSchema();
        })();

        return {
            protocol,
            CHANNEL_TYPE,
            ...toRefs(state),
            onChangeChannelName,
            onChangeModel,
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
</style>
