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
        <add-notification-level v-if="projectId" @change="onChangeLevel" />
        <p-json-schema-form :model="schemaModel" :schema="schema" :is-valid.sync="isSchemaModelValid"
                            @update:model="onChangeModel"
        />
        <div v-if="projectId && protocol === CHANNEL_TYPE.SPACEONE_USER">
            <add-notification-member-group :project-id="projectId" @change="onChangeMember" />
            <div class="tag-box">
                <p-tag v-for="(tag, i) in selectedMember" :key="tag" @delete="onDeleteTag(i)">
                    {{ tag ? tag : '' }}
                </p-tag>
            </div>
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
import AddNotificationLevel from '@/views/identity/user/modules/AddNotificationLevel.vue';
import AddNotificationMemberGroup from '@/views/identity/user/modules/AddNotificationMemberGroup.vue';
import { SpaceConnector } from '@/lib/space-connector';

enum CHANNEL_TYPE {
    AWS_SNS = 'AWSSNS',
    SLACK = 'Slack',
    SPACEONE_USER = 'SpaceONEUser',
}
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
        PTag,
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
        const protocol = vm.$route.params.protocol;

        const state = reactive({
            channelName: '',
            notificationLevel: '',
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
                level: state.notificationLevel,
            });
        };

        const onDeleteTag = (idx) => {
            state.selectedMember.splice(idx, 1);
            vm.$nextTick(() => {
                state.selectedMember = [...state.selectedMember];
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
            state.notificationLevel = value.level;
            emitChange();
        };

        (async () => {
            if (props.supportedSchema) await getSchema();
        })();

        return {
            protocol,
            CHANNEL_TYPE,
            ...toRefs(state),
            onChangeChannelName,
            onChangeModel,
            onChangeMember,
            onChangeLevel,
            onDeleteTag,
        };
    },

};
</script>

<style lang="postcss" scoped>
.base-info-input {
    max-width: 30rem;
    margin-top: 1.25rem;
}
.tag-box {
    @apply text-gray-900;
    margin-top: 0.625rem;
    .p-tag {
        margin-bottom: 0.5rem;
    }
}
</style>
