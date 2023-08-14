<script lang="ts" setup>
import {
    PAnchor, PEmpty, PPaneLayout, PHeading,
} from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { useAlertPageStore } from '@/services/alert-manager/store/alert-page-store';


interface Props {
    id: string;
}

defineProps<Props>();
const store = useStore();
const { t } = useI18n();

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.$state;

const state = reactive({
    projectList: computed(() => alertPageState.alertData?.project_dependencies ?? []),
    projects: computed(() => store.getters['reference/projectItems']),
});

// LOAD REFERENCE STORE
(async () => {
    await store.dispatch('reference/project/load');
})();

</script>

<template>
    <p-pane-layout class="project-dependency">
        <p-heading heading-type="sub"
                   :title="t('MONITORING.ALERT.DETAIL.PROJECT_DEPENDENCY.PROJECT_DEPENDENCY')"
        />
        <p v-if="state.projectList.length === 0">
            <p-empty class="empty-message">
                {{ t('MONITORING.ALERT.DETAIL.PROJECT_DEPENDENCY.NO_DATA') }}
            </p-empty>
        </p>
        <p v-for="(item, index) in state.projectList"
           v-else
           :key="`${item}-${index}`"
           class="project-name"
        >
            <p-anchor :to="referenceRouter(
                          item,
                          { resource_type: 'identity.Project' })"
                      highlight
            >
                {{ state.projects[item] ? state.projects[item].label : item }}
            </p-anchor>
        </p>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.project-dependency {
    padding: 0 1rem 2.5rem;
}
.p-heading {
    @apply -ml-1;
}
.project-name {
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
}
.empty-message {
    @apply mt-8;
}
</style>
