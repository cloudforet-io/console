<template>
    <general-page-layout>
        <p-breadcrumbs v-if="routeState.routes.length"
                       class="flex-grow"
                       :routes="routeState.routes"
        />
        <p-heading show-back-button
                   :title="pageTitle"
                   class="page-title"
                   @click-back-button="$router.go(-1)"
        />
        <notification-add-form :project-id="projectId"
                               :protocol-id="protocolId"
                               :protocol-type="protocolType"
                               :supported-schema="supportedSchema"
                               :user-id="userId"
        />
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, onActivated, reactive, toRefs,
} from 'vue';
import VueI18n from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import {
    PBreadcrumbs, PHeading,
} from '@spaceone/design-system';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import NotificationAddForm from '@/services/notification/notification-add/modules/NotificationAddForm.vue';

import TranslateResult = VueI18n.TranslateResult;

export default {
    name: 'ProjectNotificationAddPage',
    components: {
        NotificationAddForm,
        PBreadcrumbs,
        PHeading,
        GeneralPageLayout,
    },

    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            pageTitle: '' as TranslateResult,
            //
            userId: decodeURIComponent(vm.$route.params.userId),
            projectId: computed(() => vm.$route.query.projectId),
            protocolId: computed(() => vm.$route.params.protocolId),
            protocolType: computed(() => vm.$route.query.protocolType),
            supportedSchema: computed(() => vm.$route.query.supported_schema),
        });

        const routeState = reactive({
            projectRoutes: computed(() => [
                { name: 'Project', path: `/project/${state.projectId}` },
                { name: 'Add Notifications Channel' },
            ]),
            routes: computed(() => (state.projectId ? routeState.projectRoutes : [])),
        });

        (async () => {
            const protocolLabel = decodeURIComponent(vm.$route.query?.protocolLabel as any);
            state.pageTitle = computed(() => vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel })) as unknown as TranslateResult;
        })();

        onActivated(() => {
            const protocolLabel = decodeURIComponent(vm.$route.query?.protocolLabel as any);
            state.pageTitle = computed(() => vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel })) as unknown as TranslateResult;
        });

        return {
            ...toRefs(state),
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.page-title {
    text-transform: capitalize;
}
</style>
