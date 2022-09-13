<template>
    <p-pane-layout class="service-account-project">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')">
            <template v-if="mode === 'READ'" #extra>
                <p-button icon="ic_edit">
                    <!--song-lang-->
                    Edit
                </p-button>
            </template>
        </p-panel-top>
        <div class="content-wrapper">
            <div v-if="mode === 'READ'">
                <p-anchor :href="readState.projectLink">
                    {{ readState.projectName }}
                </p-anchor>
            </div>
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
import {
    PPaneLayout, PPanelTop, PButton, PAnchor,
} from '@spaceone/design-system';
import type { PropType } from 'vue';
import { computed, reactive, watch } from 'vue';


import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

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
        PButton,
        PAnchor,
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
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const readState = reactive({
            projects: computed(() => store.getters['reference/projectItems']),
            projectName: computed(() => {
                if (props.projectId) {
                    return readState.projects[props.projectId]?.label ?? '';
                }
                return '';
            }),
            projectLink: computed(() => {
                if (props.projectId) {
                    return SpaceRouter.router.resolve(referenceRouter(props.projectId, {
                        resource_type: 'identity.Project',
                    })).href;
                }
                return undefined;
            }),
        });
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

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
            ]);
        })();

        /* Watcher */
        watch(() => formState.formData, (formData) => {
            emit('change', formData);
        });

        return {
            readState,
            formState,
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
