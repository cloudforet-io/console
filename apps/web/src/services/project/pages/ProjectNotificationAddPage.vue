<script setup lang="ts">
import { asyncComputed } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PBreadcrumbs, PHeading,
} from '@spaceone/design-system';
import type { Route } from '@spaceone/design-system/types/navigation/breadcrumbs/type';
import { isEmpty } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceItem, ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { referenceRouter } from '@/lib/reference/referenceRouter';
import { queryStringToString } from '@/lib/router-query-string';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import NotificationAddForm from '@/services/my-page/components/NotificationAddForm.vue';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import type {
    ProjectNotificationAddPageUrlQueryValue,
} from '@/services/project/types/project-notification-add-page-url-query-type';


const route = useRoute();

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
});

const state = reactive({
    protocolLabel: asyncComputed<string>(async () => {
        const labelFromQuery = queryStringToString(route.query?.protocolLabel);
        if (labelFromQuery) return labelFromQuery;
        await store.dispatch('reference/protocol/load');
        const protocols = store.getters['reference/protocolItems'];
        return protocols[state.protocolId]?.label;
    }, '', { lazy: true, onError: (e) => console.error(e) }),
    pageTitle: computed(() => i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: state.protocolLabel })),
    projectId: computed<string>(() => route.params.id),
    protocolId: computed<string>(() => route.params.protocolId),
    protocolType: computed<ProjectNotificationAddPageUrlQueryValue['protocolType']>(() => {
        const protocolType = route.query.protocolType;
        if (protocolType) {
            return queryStringToString(protocolType);
        }
        return undefined;
    }),
    project: computed<ProjectReferenceItem>(() => storeState.projects[state.projectId]),
});

const routeState = reactive({
    routes: computed<Route[]>(() => {
        let results: Route[] = [
            { name: i18n.t('MENU.PROJECT') as string, to: { name: PROJECT_ROUTE._NAME } },
        ];
        if (!isEmpty(state.project.data.groupInfo)) {
            results.push({
                name: state.project.data.groupInfo?.name,
                to: referenceRouter(state.project.data.groupInfo?.id, { resource_type: 'identity.ProjectGroup' }),
            });
        }
        results = results.concat([
            { name: state.project?.name, to: referenceRouter(state.projectId, { resource_type: 'identity.Project' }) },
            { name: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: state.protocolLabel }) as string },
        ]);
        return results;
    }),
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
        />
    </general-page-layout>
</template>

<style lang="postcss" scoped>
.page-title {
    text-transform: capitalize;
}
</style>
