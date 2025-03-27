<template>
    <div class="service-account-project-form">
        <project-select-dropdown
            class="project-select-dropdown"
            :selected-project-ids="selectedProjects"
            :use-fixed-menu-style="false"
            :invalid="proxyIsValid === false"
            project-selectable
            :project-group-selectable="false"
            @update:selected-project-ids="handleSelectedProject"
        />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, watch,
} from 'vue';

import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import type { ProjectForm } from '@/services/service-account/types/service-account-page-type';


export default {
    name: 'ServiceAccountProjectForm',
    components: {
        ProjectSelectDropdown,
    },
    props: {
        isValid: {
            type: Boolean,
            default: undefined,
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            selectedProjects: [] as Array<string>,
            formData: { selectedProjectId: undefined } as Partial<ProjectForm>,
            proxyIsValid: useProxyValue('is-valid', props, emit),
        });

        /* Event */
        const handleSelectedProject = (selectedProject: string[]) => {
            state.selectedProjects = selectedProject;
            state.formData = { selectedProjectId: selectedProject.length ? selectedProject[0] : undefined };
            state.proxyIsValid = !!selectedProject.length;
        };

        /* Watcher */
        watch(() => props.projectId, (projectId) => {
            if (projectId) {
                state.formData = { selectedProjectId: projectId };
                state.selectedProjects = [projectId];
            }
        }, { immediate: true });
        watch(() => state.formData, (formData: Partial<ProjectForm>) => {
            emit('change', formData);
        });

        return {
            ...toRefs(state),
            handleSelectedProject,
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-account-project-form {
    .project-select-dropdown {
        max-width: 30rem;
        width: 100%;
    }

    @screen tablet {
        .project-select-dropdown {
            width: 100%;
        }
    }
}
</style>
