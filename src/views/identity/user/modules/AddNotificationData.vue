<template>
    <p-pane-layout class="content-wrapper">
        <h3 class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.BASE_INFO') }}
        </h3>
        <p-field-group :label="$t('IDENTITY.USER.NOTIFICATION.FORM.ESCALATION_LEVEL')" required class="level-dropdown">
            <template #default>
                <p-select-dropdown v-model="escalationLevel" :items="LEVEL_LIST" :use-custom-style="true" />
            </template>
        </p-field-group>
        <p-field-group
            v-if="channel === CHANNEL_TYPE.SMS || channel === CHANNEL_TYPE.VOICE"
            :label="$t('IDENTITY.USER.NOTIFICATION.FORM.PHONE_NUMBER')"
            :invalid="!isPhoneNumValid"
            :invalid-text="'Invalid Phone number format!'"
            required
            class="base-info-input"
        >
            <template #default="{invalid}">
                <p-text-input v-model="phoneNum" :invalid="!isPhoneNumValid" class="text-input"
                              block @input="onChangePhoneNum"
                />
            </template>
        </p-field-group>
        <p-field-group
            v-else-if="channel === CHANNEL_TYPE.SLACK"
            :label="$t('IDENTITY.USER.NOTIFICATION.FORM.SLACK_TOKEN')"
            required
            class="base-info-input"
        >
            <template #default="{invalid}">
                <p-text-input v-model="slackToken" />
            </template>
        </p-field-group>
        <div v-else>
            <add-notification-member-group :project-id="projectId" />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PFieldGroup, PPaneLayout, PSelectDropdown, PTextInput,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
// eslint-disable-next-line import/named
import { notiChannelPhoneNumRegex } from '@/views/identity/user/lib/validations';
import AddNotificationMemberGroup from '@/views/identity/user/modules/AddNotificationMemberGroup.vue';

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
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const channel = vm.$route.params.channel;
        const projectId = vm.$route.query.projectId;
        const state = reactive({
            phoneNum: '',
            slackToken: '',
            showPhoneNumValidation: false,
            isPhoneNumValid: computed(() => (!state.showPhoneNumValidation || notiChannelPhoneNumRegex.test(state.phoneNum))),
            escalationLevel: 1,
        });

        const emitChange = () => {
            emit('change', {
                name: state.name,
            }, state.isPhoneNumValid);
        };

        const onChangePhoneNum = () => {
            if (!state.showPhoneNumValidation) state.showPhoneNumValidation = true;
            emitChange();
        };

        return {
            channel,
            CHANNEL_TYPE,
            LEVEL_LIST,
            projectId,
            ...toRefs(state),
            onChangePhoneNum,
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
