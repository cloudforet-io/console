<template>
    <p-pane-layout class="service-account-project-detail">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')">
            <template #extra>
                <p-button v-if="!editMode" :disabled="!projectName" icon="ic_edit"
                          :style-type="!projectName && 'transparent'"
                          @click="handleEditMode"
                >
                    <!--song-lang-->
                    Edit
                </p-button>
                <div v-else>
                    <p-button @click="handleEditMode">
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
                                     @select="handleSelectProject"
            />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PPaneLayout, PPanelTop, PButton, PAnchor,
} from '@spaceone/design-system';
import type { SetupContext } from 'vue';
import { computed, reactive, toRefs } from 'vue';


import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import type { ProjectForm } from '@/services/asset-inventory/service-account/type';
import type { ProjectGroupTreeItem, ProjectItemResp } from '@/services/project/type';


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


        const handleEditMode = () => { state.editMode = !state.editMode; };
        const handleSelectProject = (selectedProject: ProjectItemResp[]) => {
            state.formData.selectedProject = selectedProject.length ? selectedProject[0] : null;
            state.proxyIsValid = !!selectedProject.length;
        };
        const handleClickSave = async () => {
            state.editMode = !state.editMode;
            if (!state.formData.selectedProject?.id) return;
            try {
                await SpaceConnector.client.identity.serviceAccount.update({
                    service_account_id: state.formData.selectedProject?.id ?? '',
                    project_id: props.projectId,
                });
                // song-lang
                showSuccessMessage('Successfully changed project', '');
            } catch (e: unknown) {
                ErrorHandler.handleError(e);
            }
        };

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            handleEditMode,
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
