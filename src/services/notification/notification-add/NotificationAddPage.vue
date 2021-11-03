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
                <add-notification-data :project-id="projectId" :supported-schema="supportedSchema"
                                       :protocol-type="protocolType" :protocol-id="protocolId"
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
                :disabled="!isDataValid || !isScheduleValid || !isTopicValid"
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
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import AddNotificationData from '@/services/notification/notification-add/modules/AddNotificationData.vue';
import AddNotificationTopic from '@/services/notification/modules/AddNotificationTopic.vue';
import AddNotificationSchedule from '@/services/notification/modules/AddNotificationSchedule.vue';
import VueI18n from 'vue-i18n';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

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
            type: '',
            pageTitle: '' as TranslateResult,
            description: null,
            project: {} as any,
            //
            userId: decodeURIComponent(vm.$route.params.userId),
            projectId: vm.$route.query.projectId,
            protocolId: vm.$route.params.protocolId,
            protocolType: vm.$route.query.protocolType,
            supportedSchema: vm.$route.query.supported_schema,
            //
            isDataValid: false,
            notificationLevel: 'LV1',
            //
            channelName: '',
            data: {},
            topicMode: false,
            topicList: [],
            isTopicValid: true,
            //
            schedule: null,
            isScheduled: false,
            isScheduleValid: true,
        });


        const routeState = reactive({
            userRoutes: computed(() => [
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION') },
            ]),
            projectRoutes: computed(() => [
                { name: vm.$t('MENU.PROJECT.PROJECT'), path: `/project/${state.projectId}` },
                { name: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION') },
            ]),
            routes: computed(() => (state.projectId ? routeState.projectRoutes : routeState.userRoutes)),
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
            try {
                if (state.projectId) await createProjectChannel();
                else await createUserChannel();
                vm.$router.back();
            } catch (e) {
                console.error(e);
            }
        };

        const onChangeData = (value) => {
            state.channelName = value.channelName;
            state.data = value.data;
            state.notificationLevel = value.level;
            state.isDataValid = value.isValid;
        };

        const onChangeSchedule = (value) => {
            state.schedule = value.schedule;
            state.isScheduled = value.is_scheduled;
            state.isScheduleValid = value.isScheduleValid;
        };

        const onChangeTopic = (value) => {
            state.topicMode = value.topicMode;
            state.topicList = value.selectedTopic;
            state.isTopicValid = value.isTopicValid;
        };

        (async () => {
            const protocolLabel = decodeURIComponent(vm.$route.query?.protocolLabel as any);
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
    padding: 2rem 1rem 3.5rem;
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
