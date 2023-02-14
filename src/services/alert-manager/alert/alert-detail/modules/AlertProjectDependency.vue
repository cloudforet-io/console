<template>
    <p-pane-layout class="project-dependency">
        <p-heading heading-type="sub"
                   :title="$t('MONITORING.ALERT.DETAIL.PROJECT_DEPENDENCY.PROJECT_DEPENDENCY')"
        />
        <p v-if="projectList.length === 0">
            <p-empty class="empty-message">
                {{ $t('MONITORING.ALERT.DETAIL.PROJECT_DEPENDENCY.NO_DATA') }}
            </p-empty>
        </p>
        <p v-for="(item, index) in projectList"
           v-else
           :key="`${item}-${index}`"
           class="project-name"
        >
            <p-anchor :to="referenceRouter(
                          item,
                          { resource_type: 'identity.Project' })"
                      highlight
            >
                {{ projects[item] ? projects[item].label : item }}
            </p-anchor>
        </p>
    </p-pane-layout>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PAnchor, PEmpty, PPaneLayout, PHeading,
} from '@spaceone/design-system';

import { store } from '@/store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import type { AlertDataModel } from '@/services/alert-manager/type';

export default {
    name: 'AlertProjectDependency',
    components: {
        PPaneLayout,
        PHeading,
        PAnchor,
        PEmpty,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
        alertData: {
            type: Object,
            default: () => ({}) as PropType<AlertDataModel>,
        },
    },
    setup(props) {
        const state = reactive({
            projectList: props.alertData?.project_dependencies,
            projects: computed(() => store.getters['reference/projectItems']),
        });

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/project/load');
        })();

        return {
            referenceRouter,
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-dependency {
    padding: 0 1rem 2.5rem 1rem;
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
