<template>
    <p-pane-layout class="service-account-project-detail">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')">
            <template #extra>
                <p-button v-if="!editMode" :disabled="!projectName" icon="ic_edit"
                          @click="handleClickEditButton"
                >
                    <!--song-lang-->
                    Edit
                </p-button>
                <div v-else>
                    <p-button @click="handleClickEditButton">
                        <!--                        song-lang-->
                        Cancel
                    </p-button>
                    <p-button style-type="primary-dark" @click="handleClickSave">
                        <!--                        song-lang-->
                        Save
                    </p-button>
                </div>
            </template>
        </p-panel-top>
        <div class="content-wrapper">
            <p-anchor v-if="!editMode && !!projectName" :href="projectLink">
                {{ projectName }}
            </p-anchor>
            <span v-if="!editMode && !projectName">N/A</span>
            <project-select-dropdown v-if="editMode"
                                     class="project-select-dropdown"
                                     project-selectable
                                     :selected-project-id="selectedProjects"
                                     :use-fixed-menu-style="false"
            />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop, PButton, PAnchor,
} from '@spaceone/design-system';
import type { SetupContext } from 'vue';
import { computed, reactive, toRefs } from 'vue';


import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import type { ProjectForm } from '@/services/asset-inventory/service-account/type';
import type { ProjectGroupTreeItem } from '@/services/project/type';


export default {
    name: 'ServiceAccountProjectDetail',
    components: {
        PPaneLayout,
        PPanelTop,
        PButton,
        PAnchor,
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
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            projectName: computed<string>(() => {
                if (props.projectId) {
                    return state.projects[props.projectId]?.label ?? '';
                }
                return '';
            }),
            projectLink: computed<string|undefined>(() => {
                if (props.projectId) {
                    return SpaceRouter.router.resolve(referenceRouter(props.projectId, {
                        resource_type: 'identity.Project',
                    })).href;
                }
                return undefined;
            }),
            editMode: false,
            selectedProjects: [] as ProjectGroupTreeItem[],
            formData: computed<ProjectForm>(() => ({
                selectedProject: state.selectedProjects,
            })),
            proxyIsValid: useProxyValue('is-valid', props, emit),
        });


        const handleClickEditButton = () => { state.editMode = !state.editMode; };
        const handleSelectProject = (selectedProject) => {
            state.formData.selectedProject = selectedProject.length ? selectedProject[0] : null;
            state.proxyIsValid = !!selectedProject.length;
        };
        const handleClickSave = () => { state.editMode = !state.editMode; };

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            handleClickEditButton,
            handleSelectProject,
            handleClickSave,
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-account-project-detail {
    .p-panel-top::v-deep {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper {
        padding: 0.5rem 1rem 2.5rem 1rem;
        .project-select-dropdown {
            width: 100%;
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
