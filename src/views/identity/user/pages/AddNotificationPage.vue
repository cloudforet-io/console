<template>
    <general-page-layout class="add-noti-wrapper">
        <p-breadcrumbs class="flex-grow" :routes="routeState.routes" />
        <p-page-title child :title="pageTitle" class="page-title"
                      @goBack="$router.go(-1)"
        />
        <section class="content-list-wrapper">
            <p-pane-layout class="content-wrapper">
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.BASE_INFO') }}
                </h3>
                <add-notification-data :project-id="projectId" :supported-schema="supportedSchema" :protocol-type="protocolType"
                                       @change="onChangeData"
                />
            </p-pane-layout>
            <p-pane-layout class="content-wrapper">
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') }}
                </h3>
                <h4 class="sub-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING_MODE') }}
                </h4>
                <add-notification-schedule @change="onChangeSchedule" />
            </p-pane-layout>
            <p-pane-layout class="content-wrapper">
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') }}
                </h3>
                <h4 class="sub-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING_MODE') }}
                </h4>
                <add-notification-topic @change="onChangeTopic" />
            </p-pane-layout>
        </section>
        <div class="button-group">
            <p-button style-type="gray900" :outline="true" class="text-button"
                      @click="$router.go(-1)"
            >
                {{ $t('COMMON.TAGS.CANCEL') }}
            </p-button>
            <p-button
                style-type="primary-dark"
                class="text-button"
                :disabled="!isDataValid"
                @click="onClickSave"
            >
                {{ $t('COMMON.TAGS.SAVE') }}
            </p-button>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PButton, PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import AddNotificationData from '@/views/identity/user/modules/AddNotificationData.vue';
import AddNotificationTopic from '@/views/identity/user/modules/AddNotificationTopic.vue';
import AddNotificationSchedule from '@/views/identity/user/modules/AddNotificationSchedule.vue';
import VueI18n from 'vue-i18n';
import { store } from '@/store';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

import TranslateResult = VueI18n.TranslateResult;

export default {
    name: 'AddNotificationPage',
    components: {
        AddNotificationData,
        AddNotificationSchedule,
        AddNotificationTopic,
        GeneralPageLayout,
        PBreadcrumbs,
        PPaneLayout,
        PPageTitle,
        PButton,
    },

    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            escalationLevel: 1,
            type: '',
            pageTitle: '' as TranslateResult,
            projectId: vm.$route.query.projectId,
            protocolId: vm.$route.params.protocolId,
            protocolType: vm.$route.query.protocolType,
            supportedSchema: vm.$route.query.supported_schema,
            isDataValid: false,
            //
            channelName: '',
            data: {},
            topicMode: false,
            topicList: [],
            schedule: null,
            isScheduled: false,
            notificationLevel: null,
            userId: store.state.user.userId,
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION') },
            ])),
        });

        const createUserChannel = async () => {
            try {
                await SpaceConnector.client.notification.userChannel.create({
                    protocol_id: state.protocolId,
                    name: state.channelName,
                    data: state.data,
                    schema: state.supportedSchema,
                    is_subscribe: state.topicMode,
                    subscriptions: state.topicList,
                    schedule: state.schedule,
                    is_scheduled: state.isScheduled,
                    user_id: state.userId,
                });
                showSuccessMessage(vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_CREATE_USER_CHANNEL'), '', context.root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_CREATE_USER_CHANNEL'), e, context.root);
            }
        };

        const createProjectChannel = async () => {
            try {
                await SpaceConnector.client.notification.projectChannel.create({
                    protocol_id: state.protocolId,
                    name: state.channelName,
                    data: state.data,
                    schema: state.supportedSchema,
                    is_subscribe: state.topicMode,
                    subscriptions: state.topicList,
                    schedule: state.schedule,
                    is_scheduled: state.isScheduled,
                    user_id: state.userId,
                    notification_level: state.notificationLevel,
                    project_id: state.projectId,
                });
                showSuccessMessage(vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_CREATE_PROJECT_CHANNEL'), '', context.root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_CREATE_PROJECT_CHANNEL'), e, context.root);
            }
        };

        const onClickSave = async () => {
            if (state.projectId) await createProjectChannel();
            else await createUserChannel();
        };

        const onChangeData = (value) => {
            state.channelName = value.channelName;
            state.data = value.data;
            state.notificationLevel = value.level;
            state.isDataValid = value.isValid;

        };

        const onChangeSchedule = (value) => {
            state.schedule = value.schedule;
            state.isScheduled = value.isScheduled;
        };

        const onChangeTopic = (value) => {
            state.topicMode = value.topicMode;
            state.topicList = value.selectedTopic;
        };

        (async () => {
            const protocolLabel = vm.$route.query.protocolLabel;
            state.pageTitle = computed(() => vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel })) as unknown as TranslateResult;
        })();

        return {
            ...toRefs(state),
            routeState,
            onClickSave,
            onChangeData,
            onChangeSchedule,
            onChangeTopic,
        };
    },
};
</script>

<style lang="postcss" scoped>
.content-list-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
}
.page-title {
    text-transform: capitalize;
}
.button-group {
    display: flex;
    justify-content: flex-end;
    .text-button {
        margin-left: 1rem;
    }
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
.sub-title {
    @apply font-bold;
    font-size: 0.875rem;
    line-height: 140%;
    margin-top: 1.25rem;
    margin-bottom: 0.375rem;
}
</style>
