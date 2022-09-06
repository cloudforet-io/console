<template>
    <p-pane-layout class="service-account-project">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')" />
        <div class="content-wrapper">
            <project-select-dropdown v-if="mode === 'CREATE'"
                                     class="project-select-dropdown"
                                     project-selectable
                                     :selected-project-ids="formState.selectedProjects"
                                     :use-fixed-menu-style="false"
                                     :invalid="formState.proxyIsValid === false"
                                     @select="handleSelectedProject"
            />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';
import { computed, reactive, watch } from '@vue/composition-api';

import {
    PPaneLayout, PPanelTop,
} from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import type { PageMode, ProjectForm } from '@/services/asset-inventory/service-account/type';
import type { ProjectGroupTreeItem } from '@/services/project/type';


export default {
    name: 'ServiceAccountProject',
    components: {
        PPaneLayout,
        PPanelTop,
        ProjectSelectDropdown,
    },
    props: {
        mode: {
            type: String as PropType<PageMode>,
            default: 'READ',
        },
        isValid: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const formState = reactive({
            selectedProjects: [] as ProjectGroupTreeItem[],
            formData: computed<ProjectForm>(() => ({
                selectedProject: formState.selectedProjects,
            })),
            proxyIsValid: useProxyValue('is-valid', props, emit),
        });

        /* Event */
        const handleSelectedProject = (selectedProject) => {
            formState.formData.selectedProject = selectedProject.length ? selectedProject[0] : null;
            formState.proxyIsValid = !!selectedProject.length;
        };

        /* Watcher */
        watch(() => formState.formData, (formData) => {
            emit('change', formData);
        });

        return {
            formState,
            handleSelectedProject,
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-account-project {
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
