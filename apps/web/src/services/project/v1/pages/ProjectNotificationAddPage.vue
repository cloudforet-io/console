<script setup lang="ts">
import { asyncComputed } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PHeading } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceItem, ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { queryStringToString } from '@/lib/router-query-string';

import NotificationAddForm from '@/services/my-page/components/NotificationAddForm.vue';
import type {
    ProjectNotificationAddPageUrlQueryValue,
} from '@/services/project/v1/types/project-notification-add-page-url-query-type';

const route = useRoute();

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
});

const state = reactive({
    protocolLabel: asyncComputed<string>(async () => {
        const labelFromQuery = queryStringToString(route.query?.protocolLabel);
        if (labelFromQuery) return labelFromQuery;
        const protocols = allReferenceStore.getters.protocol;
        return protocols[state.protocolId]?.label;
    }, '', { lazy: true, onError: (e) => console.error(e) }),
    pageTitle: computed(() => (state.protocolType === 'INTERNAL'
        ? i18n.t('IAM.USER.NOTIFICATION.ASSOCIATED_MEMBER')
        : i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: state.protocolLabel })
    )),
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
</script>

<template>
    <div>
        <p-heading show-back-button
                   :title="state.pageTitle"
                   class="page-title"
                   @click-back-button="$router.go(-1)"
        />
        <notification-add-form :project-id="state.projectId"
                               :protocol-id="state.protocolId"
                               :protocol-type="state.protocolType ?? ''"
        />
    </div>
</template>

<style lang="postcss" scoped>
.page-title {
    @apply mb-6;
    text-transform: capitalize;
}
</style>
