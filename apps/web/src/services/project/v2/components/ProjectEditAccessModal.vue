<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PI, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectType } from '@/api-clients/identity/project/schema/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray, indigo } from '@/styles/colors';

import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.projectEditAccessModalVisible);
const targetId = computed(() => projectPageModalStore.state.targetId);

const state = reactive({
    accessMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        {
            name: 'PRIVATE',
            label: i18n.t('PROJECT.LANDING.ONLY_PEOPLE_INVITED'),
            icon: 'ic_lock-filled',
            iconColor: gray[800],
        },
        {
            name: 'PUBLIC',
            label: i18n.t('PROJECT.LANDING.EVERYONE_AT_THIS_WORKSPACE'),
            icon: 'ic_globe-filled',
            iconColor: indigo[600],
        },
    ])),
    selectedAccess: 'PRIVATE' as ProjectType,
});

const {
    data: project, isLoading, setQueryData,
} = useProjectQuery({
    projectId: targetId,
    enabled: visible,
});

watch([visible, project], ([v, prj]) => {
    if (!v) return;
    if (prj) {
        state.selectedAccess = prj.project_type ?? 'PRIVATE';
    }
}, { immediate: true });

/* mutations */
const projectListStore = useProjectListStore();
const { projectAPI } = useProjectApi();
const { mutateAsync: updateProjectType, isPending: isUpdatingProjectType } = useMutation({
    mutationFn: ({ projectId, projectType }: { projectId: string; projectType: ProjectType }) => projectAPI.updateProjectType({
        project_id: projectId,
        project_type: projectType,
    }),
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_PROJECT_TYPE'), '');
        setQueryData(data);
        projectListStore.syncProject(data);
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_PROJECT_TYPE'));
    },
});

/* Event */
const confirm = async () => {
    if (isUpdatingProjectType.value) return;

    if (state.selectedAccess !== project.value?.project_type) {
        await updateProjectType({
            projectId: targetId.value as string,
            projectType: state.selectedAccess,
        });
    }
    projectPageModalStore.closeEditAccessModal();
};

const handleSelectAccess = (selectedAccess) => {
    state.selectedAccess = selectedAccess as ProjectType;
};
</script>

<template>
    <p-button-modal class="project-edit-access-modal"
                    :header-title="$t('PROJECT.DETAIL.MODAL_EDIT_ACCESS_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :loading-backdrop="isLoading"
                    :visible="visible"
                    :loading="isUpdatingProjectType"
                    @close="projectPageModalStore.closeEditAccessModal"
                    @cancel="projectPageModalStore.closeEditAccessModal"
                    @closed="projectPageModalStore.resetTarget"
                    @confirm="confirm"
    >
        <template #body>
            <p-field-group :label="$t('PROJECT.DETAIL.ACCESS')"
                           required
            >
                <template #default>
                    <p-select-dropdown class="access-dropdown"
                                       :menu="state.accessMenuItems"
                                       :selected="state.selectedAccess"
                                       use-fixed-menu-style
                                       @select="handleSelectAccess"
                    >
                        <template #dropdown-button>
                            <div class="text-wrapper">
                                <p-i :name="state.selectedAccess === 'PRIVATE' ? 'ic_lock-filled' : 'ic_globe-filled'"
                                     width="1rem"
                                     height="1rem"
                                     :color="state.selectedAccess === 'PRIVATE' ? gray[900] : indigo[600]"
                                />
                                <span>{{ state.selectedAccess === 'PRIVATE' ? $t('PROJECT.LANDING.ONLY_PEOPLE_INVITED') : $t('PROJECT.LANDING.EVERYONE_AT_THIS_WORKSPACE') }}</span>
                                <span class="sub-text">
                                    {{ $t('PROJECT.LANDING.CAN_ACCESS_TO_THIS_PROJECT') }}
                                </span>
                            </div>
                        </template>
                    </p-select-dropdown>
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.project-edit-access-modal {
    .access-dropdown {
        width: 100%;
        .text-wrapper {
            @apply text-gray-800 text-label-md;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        .sub-text {
            @apply text-gray-500;
        }
    }
}
</style>
