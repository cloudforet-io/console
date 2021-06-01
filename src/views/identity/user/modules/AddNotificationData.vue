<template>
    <p-pane-layout class="content-wrapper">
        <h3 class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.BASE_INFO') }}
        </h3>
        <p-field-group
            :label="$t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME')"
            required
            class="base-info-input"
        >
            <template #default="{invalid}">
                <p-text-input v-model="channelName" />
            </template>
        </p-field-group>
        <p-field-group v-if="projectId" :label="$t('IDENTITY.USER.NOTIFICATION.FORM.ESCALATION_LEVEL')" required
                       class="level-dropdown"
        >
            <template #default>
                <p-select-dropdown v-model="escalationLevel" :items="LEVEL_LIST" :use-custom-style="true" />
            </template>
        </p-field-group>
        <p-json-schema-form :model.sync="schemaModel" :schema="schema" :is-valid.sync="isSchemaModelValid" />
        <div v-if="projectId">
            <add-notification-member-group :project-id="projectId" />
        </div>
    </p-pane-layout>
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
        });

        const getSchema = async () => {
            const res = await SpaceConnector.client.repository.schema.get({
                name: props.supportedSchema,
            });
            state.schema = res.schema;
        };

        (async () => {
            if (props.supportedSchema) await getSchema();
        })();

        return {
            channel,
            CHANNEL_TYPE,
            LEVEL_LIST,
            ...toRefs(state),
        };
    },

};
</script>

<style lang="postcss" scoped>
.content-wrapper {
    padding-left: 1rem;
    padding-top: 2rem;
    padding-bottom: 3.5rem;
}
.content-title {
    font-size: 1.5rem;
    line-height: 135%;
}
.base-info-input {
    max-width: 30rem;
    margin-top: 1.25rem;
}
.level-dropdown {
    margin-top: 1.5rem;
    max-width: 15rem;
}
</style>
