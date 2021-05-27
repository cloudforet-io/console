<template>
    <general-page-layout class="add-noti-wrapper">
        <p-breadcrumbs class="flex-grow" :routes="routeState.routes" />
        <p-page-title child @goBack="$router.go(-1)" />
        <section class="content-list-wrapper">
            <p-pane-layout class="content-wrapper">
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.BASE_INFO') }}
                </h3>
                <p-field-group
                    v-if="channel !== CHANNEL_TYPE.SLACK"
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
                    v-else
                    :label="$t('IDENTITY.USER.NOTIFICATION.FORM.SLACK_TOKEN')"
                    required
                    class="base-info-input"
                >
                    <template #default="{invalid}">
                        <p-text-input v-model="slackToken" disabled />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('IDENTITY.USER.NOTIFICATION.FORM.ESCALATION_LEVEL')" required class="level-dropdown">
                    <template #default>
                        <p-select-dropdown v-model="escalationLevel" :items="LEVEL_LIST" :use-custom-style="true" />
                    </template>
                </p-field-group>
            </p-pane-layout>
            <p-pane-layout class="content-wrapper">
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') }}
                </h3>
                <h4 class="sub-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING_MODE') }}
                </h4>
            </p-pane-layout>
            <p-pane-layout class="content-wrapper">
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') }}
                </h3>
                <h4 class="sub-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING_MODE') }}
                </h4>
            </p-pane-layout>
        </section>
        <div class="button-group">
            <p-button style-type="gray900" :outline="true" class="text-button"
                      @click="$router.go(-1)"
            >
                {{ $t('COMMON.TAGS.CANCEL') }}
            </p-button>
            <p-button
                style-type="secondary"
                class="text-button"
                @click="onClickSave"
            >
                {{ $t('COMMON.TAGS.SAVE') }}
            </p-button>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PButton, PFieldGroup, PPageTitle, PPaneLayout, PSelectDropdown, PTextInput,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
// eslint-disable-next-line import/named
import { notiChannelPhoneNumRegex } from '@/views/identity/user/lib/validations';

enum CHANNEL_TYPE {
    SMS = 'sms',
    VOICE = 'voice',
    SLACK = 'slack',
}
const LEVEL_LIST = [
    { label: 'Level 1', name: 1, type: 'item' },
    { label: 'Level 2', name: 2, type: 'item' },
    { label: 'Level 3', name: 3, type: 'item' },
];
export default {
    name: 'AddNotiChannelPage',
    components: {
        GeneralPageLayout,
        PBreadcrumbs,
        PPageTitle,
        PPaneLayout,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
        PButton,
    },

    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const channel = vm.$route.params.channel;
        const state = reactive({
            phoneNum: '',
            slackToken: '',
            showPhoneNumValidation: false,
            isPhoneNumValid: computed(() => (!state.showPhoneNumValidation || notiChannelPhoneNumRegex.test(state.phoneNum))),
            escalationLevel: 1,
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION') },
            ])),
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

        const onClickSave = () => {
            console.log('save!!');
        };

        return {
            channel,
            CHANNEL_TYPE,
            LEVEL_LIST,
            ...toRefs(state),
            routeState,
            onChangePhoneNum,
            onClickSave,
        };
    },
};
</script>

<style lang="postcss" scoped>
.content-list-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 5rem;
}
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
.sub-title {
    @apply font-bold;
    font-size: 0.875rem;
    line-height: 140%;
    margin-top: 1.25rem;
    margin-bottom: 0.375rem;
}
.button-group {
    display: flex;
    justify-content: flex-end;
    .text-button {
        margin-left: 1rem;
    }
}
</style>
