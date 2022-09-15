<template>
    <p-pane-layout class="service-account-project">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')" />
        <div class="content-wrapper">
            <project-select-dropdown
                class="project-select-dropdown"
                project-selectable
                :selected-project-ids="state.selectedProjects"
                :use-fixed-menu-style="false"
                :invalid="state.proxyIsValid === false"
                @select="handleSelectedProject"
            />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop,
} from '@spaceone/design-system';
import { computed, reactive, watch } from 'vue';

import { store } from '@/store';

import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import type { ProjectForm } from '@/services/asset-inventory/service-account/type';
import type { ProjectGroupTreeItem } from '@/services/project/type';


export default {
    name: 'ServiceAccountProjectForm',
    components: {
        PPaneLayout,
        PPanelTop,
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
            selectedProjects: [] as ProjectGroupTreeItem[],
            formData: computed<ProjectForm>(() => ({
                selectedProject: state.selectedProjects,
            })),
            proxyIsValid: useProxyValue('is-valid', props, emit),
        });

        /* Event */
        const handleSelectedProject = (selectedProject) => {
            state.formData.selectedProject = selectedProject.length ? selectedProject[0] : null;
            state.proxyIsValid = !!selectedProject.length;
        };

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
            ]);
        })();

        /* Watcher */
        watch(() => state.formData, (formData) => {
            emit('change', formData);
        });

        return {
            state,
            handleSelectedProject,
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-account-project {
    .p-panel-top::v-deep {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper {
        padding: 0.5rem 1rem 2.5rem 1rem;
        .project-select-dropdown {
            width: 50%;
        }
    }

    @screen tablet {
        .content-wrapper {
            .project-select-dropdown {
                width: 100%;
            }
        }
    }
}
</style>
