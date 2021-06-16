<template>
    <p-pane-layout class="project-dependency">
        <p-panel-top class="-ml-1">
            Project Dependency
        </p-panel-top>
        <p v-for="(item, index) in projectList" :key="`${item}-${index}`" class="project-name">
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
import { PAnchor, PPaneLayout, PPanelTop } from '@spaceone/design-system';
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
            state.projectList = ['project-18655561c535', 'project-9074eea97d7e'];
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
