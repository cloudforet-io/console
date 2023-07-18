<script lang="ts" setup>
import {
    PBreadcrumbs, PHeading,
} from '@spaceone/design-system';
import {
    computed, onActivated, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import NotificationAddForm from '@/services/notification/notification-add/modules/NotificationAddForm.vue';


const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const state = reactive({
    pageTitle: '',
    //
    userId: decodeURIComponent(route.params.userId as string),
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
    state.pageTitle = t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel });
})();

onActivated(() => {
    const protocolLabel = decodeURIComponent(route.query?.protocolLabel as any);
    state.pageTitle = t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel });
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
                   @click-back-button="router.go(-1)"
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
