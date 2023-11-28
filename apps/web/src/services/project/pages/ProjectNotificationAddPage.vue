<script lang="ts" setup>
import {
    computed, onActivated, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PBreadcrumbs, PHeading,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import NotificationAddForm from '@/services/my-page/components/NotificationAddForm.vue';


const route = useRoute();
const state = reactive({
    pageTitle: '' as TranslateResult,
    //
    userId: decodeURIComponent(route.params.userId),
    projectId: computed(() => route.query.projectId),
    protocolId: computed(() => route.params.protocolId),
    protocolType: computed(() => route.query.protocolType),
    supportedSchema: computed(() => route.query.supported_schema),
});

const routeState = reactive({
    projectRoutes: computed(() => [
        { name: 'Project', path: `/project/${state.projectId}` },
        { name: 'Add Notifications Channel' },
    ]),
    routes: computed(() => (state.projectId ? routeState.projectRoutes : [])),
});

(async () => {
    const protocolLabel = decodeURIComponent(route.query?.protocolLabel as any);
    state.pageTitle = computed(() => i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel })) as unknown as TranslateResult;
})();

onActivated(() => {
    const protocolLabel = decodeURIComponent(route.query?.protocolLabel as any);
    state.pageTitle = computed(() => i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel })) as unknown as TranslateResult;
});
</script>

<template>
    <general-page-layout>
        <p-breadcrumbs v-if="routeState.routes.length"
                       class="flex-grow"
                       :routes="routeState.routes"
        />
        <p-heading show-back-button
                   :title="state.pageTitle"
                   class="page-title"
                   @click-back-button="$router.go(-1)"
        />
        <notification-add-form :project-id="state.projectId"
                               :protocol-id="state.protocolId"
                               :protocol-type="state.protocolType"
                               :supported-schema="state.supportedSchema"
                               :user-id="state.userId"
        />
    </general-page-layout>
</template>

<style lang="postcss" scoped>
.page-title {
    text-transform: capitalize;
}
</style>
