<template>
    <div>
        <p-field-group
            :label="$t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME')"
            required
            class="base-info-input"
        >
            <template #default="{invalid}">
                <p-text-input v-model="channelName" @input="onChangeChannelName" />
            </template>
        </p-field-group>
        <p-field-group v-if="projectId" :label="$t('IDENTITY.USER.NOTIFICATION.FORM.ESCALATION_LEVEL')" required
                       class="level-dropdown"
        >
            <template #default>
                <p-select-dropdown v-model="escalationLevel" :items="LEVEL_LIST" :use-custom-style="true"
                                   @input="onChangeLevel"
                />
            </template>
        </p-field-group>
        <p-json-schema-form :model.sync="schemaModel" :schema="schema" :is-valid.sync="isSchemaModelValid"
                            @update:model="onChangeModel"
        />
        <div v-if="projectId">
            <add-notification-member-group :project-id="projectId" @change="onChangeMember" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    PFieldGroup, PPaneLayout, PSelectDropdown, PTextInput, PJsonSchemaForm,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
// eslint-disable-next-line import/named
import { notiChannelPhoneNumRegex } from '@/views/identity/user/lib/validations';
import AddNotificationMemberGroup from '@/views/identity/user/modules/AddNotificationMemberGroup.vue';
import { SpaceConnector } from '@/lib/space-connector';

enum CHANNEL_TYPE {
    SMS = 'sms',
    VOICE = 'voice',
    SLACK = 'slack',
    MEMBER = 'member',
}
const LEVEL_LIST = [
    { label: 'Level 1', name: 1, type: 'item' },
    { label: 'Level 2', name: 2, type: 'item' },
    { label: 'Level 3', name: 3, type: 'item' },
];

export default {
    name: 'AddNotificationData',
    components: {
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
            default: null,
        },
        supportedSchema: {
            type: [String, Array],
            default: null,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const channel = vm.$route.params.channel;

        const state = reactive({
            channelName: '',
            escalationLevel: 1,
            schemaModel: {},
            schema: {},
            isSchemaModelValid: false,
            selectedMember: [],
        });

        const getSchema = async () => {
            const res = await SpaceConnector.client.repository.schema.get({
                name: props.supportedSchema,
            });
            state.schema = res.schema;
        };

        const emitChange = () => {
            emit('change', {
                channelName: state.channelName,
                data: state.schemaModel,
                member: state.selectedMember,
                level: state.escalationLevel,
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
            state.selectedMember = value.member;
            emitChange();
        };

        const onChangeLevel = (value) => {
            state.escalationLevel = value;
            emitChange();
        };

        (async () => {
            if (props.supportedSchema) await getSchema();
        })();

        return {
            channel,
            CHANNEL_TYPE,
            LEVEL_LIST,
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
.level-dropdown {
    margin-top: 1.5rem;
    max-width: 15rem;
}
</style>
