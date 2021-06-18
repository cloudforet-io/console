<template>
    <p-pane-layout class="project-dependency">
        <p-panel-top class="-ml-1">
            {{ $t('MONITORING.ALERT.DETAIL.PROJECT_DEPENDENCY.PROJECT_DEPENDENCY') }}
        </p-panel-top>
        <p v-if="projectList.length === 0">
            <p-empty class="mt-8">
                {{$t('MONITORING.ALERT.DETAIL.PROJECT_DEPENDENCY.NO_DATA')}}
            </p-empty>
        </p>
        <p v-for="(item, index) in projectList" v-else :key="`${item}-${index}`"
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
import {
    PAnchor, PEmpty, PPaneLayout, PPanelTop,
} from '@spaceone/design-system';
import { AlertDataModel } from '@/views/monitoring/alert/type';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';

interface PropsType {
    id: string;
    alertData: AlertDataModel;
}

export default {
    name: 'AlertDetailProjectDependency',
    components: {
        PPaneLayout,
        PPanelTop,
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
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            projectList: props.alertData?.project_dependencies,
            projects: computed(() => store.state.resource.project.items),
        });

        (async () => {
            await store.dispatch('resource/project/load');
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
.project-name {
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
}
</style>
