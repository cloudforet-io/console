<template>
    <general-page-layout class="add-noti-wrapper">
        <p-breadcrumbs class="flex-grow" :routes="routeState.routes" />
        <p-page-title child :title="pageTitle" class="page-title"
                      @goBack="$router.go(-1)"
        />
        <section class="content-list-wrapper">
            <add-notification-data :project-id="projectId" :supported-schema="supportedSchema" />
            <p-pane-layout class="content-wrapper">
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') }}
                </h3>
                <h4 class="sub-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING_MODE') }}
                </h4>
                <add-notification-schedule />
            </p-pane-layout>
            <p-pane-layout class="content-wrapper">
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') }}
                </h3>
                <h4 class="sub-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING_MODE') }}
                </h4>
                <add-notification-topic />
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

import TranslateResult = VueI18n.TranslateResult;

const LEVEL_LIST = [
    { label: 'Level 1', name: 1, type: 'item' },
    { label: 'Level 2', name: 2, type: 'item' },
    { label: 'Level 3', name: 3, type: 'item' },
];

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

    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            escalationLevel: 1,
            type: '',
            pageTitle: '' as TranslateResult,
            projectId: vm.$route.query.projectId,
            protocolId: vm.$route.params.protocolId,
            supportedSchema: vm.$route.query.supported_schema,
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION') },
            ])),
        });

        const onClickSave = () => {
            console.log('save!!');
        };

        (async () => {
            const channel = vm.$route.params.channel.toUpperCase();
            state.pageTitle = computed(() => vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: vm.$t(`IDENTITY.USER.NOTIFICATION.${channel}`) })) as unknown as TranslateResult;
        })();

        return {
            LEVEL_LIST,
            ...toRefs(state),
            routeState,
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
