<template>
    <p-pane-layout class="service-account-project-detail">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')">
            <template #extra>
                <p-button v-if="!editMode" :disabled="accountType === ACCOUNT_TYPE.TRUSTED && isManaged" icon="ic_edit"
                          style-type="transparent"
                          @click="handleEditMode"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT') }}
                </p-button>
                <div v-else>
                    <p-button @click="handleEditMode">
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary-dark" @click="handleClickSave">
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-panel-top>
        <div class="content-wrapper">
            <p-anchor v-if="!editMode && !!projectName" :href="projectLink">
                {{ projectName }}
            </p-anchor>
            <span v-if="!editMode && !projectName && accountType === ACCOUNT_TYPE.TRUSTED">N/A</span>
            <div v-if="!editMode && !projectName && accountType === ACCOUNT_TYPE.GENERAL">
                <span>-- <span class="required-span">{{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.REQUIRED') }}</span></span>
                <p-tooltip position="bottom" class="project-required-tooltip" :contents="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.PROJECT_REQUIRED_HELP_TEXT')">
                    <p-i name="ic_tooltip" width="1rem" height="1rem" />
                </p-tooltip>
            </div>
            <project-select-dropdown v-if="editMode"
                                     class="project-select-dropdown"
                                     project-selectable
                                     :selected-project-ids.sync="selectedProjects"
                                     :use-fixed-menu-style="false"
                                     @select="handleSelectProject"
            />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop, PButton, PAnchor, PI, PTooltip,
} from '@spaceone/design-system';
import { SpaceConnector } from 'cloudforet/core-lib/space-connector';
import type { PropType, SetupContext } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';


import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import type { AccountType, ProjectForm, ServiceAccountModel } from '@/services/asset-inventory/service-account/type';
import type { ProjectItemResp } from '@/services/project/type';


export default {
    name: 'ServiceAccountProjectDetail',
    components: {
        PPaneLayout,
        PPanelTop,
        PButton,
        PAnchor,
        ProjectSelectDropdown,
        PI,
        PTooltip,
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
        serviceAccountItem: {
            type: Object as PropType<ServiceAccountModel>,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            projectName: '',
            projectLink: '',
            editMode: false,
            selectedProjects: [] as Array<string>,
            formData: { selectedProject: null } as ProjectForm,
            proxyIsValid: useProxyValue('is-valid', props, emit),
            accountType: computed<AccountType>(() => props.serviceAccountItem?.service_account_type ?? ACCOUNT_TYPE.GENERAL),
            isManaged: computed<boolean>(() => props.serviceAccountItem?.tags?.is_managed ?? false),
        });

        /* Util */
        const AnchorDataFormatter = (projectId: string): void => {
            if (!projectId) return;
            state.projectName = state.projects[projectId].label;
            state.projectLink = SpaceRouter.router.resolve(referenceRouter(projectId, {
                resource_type: 'identity.Project',
            })).href;
        };

        /* Handler */
        const handleEditMode = () => { state.editMode = !state.editMode; };
        const handleSelectProject = (selectedProject: ProjectItemResp[]) => {
            state.formData = { selectedProject: selectedProject.length ? selectedProject[0] : null };
            state.proxyIsValid = !!selectedProject.length;
        };
        const handleClickSave = async () => {
            state.editMode = !state.editMode;
            if (!state.formData.selectedProject?.id) return;
            try {
                await SpaceConnector.client.identity.serviceAccount.update({
                    service_account_id: props.serviceAccountItem?.service_account_id ?? '',
                    project_id: state.formData.selectedProject.id,
                });
                showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_CHANGE_PROJECT'), '');
                AnchorDataFormatter(state.formData.selectedProject.id);
            } catch (e: unknown) {
                ErrorHandler.handleError(e);
            }
        };

        /* Watcher */
        watch(() => props.projectId, (id: string) => {
            AnchorDataFormatter(id);
        });
        watch(() => state.projects, () => {
            AnchorDataFormatter(state.selectedProjects[0]);
        });
        watch(() => state.selectedProjects, (selectedProject: Array<string>) => {
            state.formData = { selectedProject: { id: selectedProject[0], name: state.projects[selectedProject[0]]?.label, item_type: 'PROJECT' } };
        });

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
            ACCOUNT_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-account-project-detail {
    /* custom design-system component - p-panel-top */
    :deep(.p-panel-top) {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper {
        padding: 0.5rem 1rem 2.5rem 1rem;
        .required-span {
            @apply text-red-500 mx-1;
        }
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

<style lang="postcss" >
/* custom design-system component - p-tooltip */
.p-tooltip {
    .tooltip-inner {
        white-space: pre-line;
    }
}
</style>
