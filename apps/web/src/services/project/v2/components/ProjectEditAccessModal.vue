<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PI, PRadio, PRadioGroup,
} from '@cloudforet/mirinae';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectType } from '@/api-clients/identity/project/schema/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.projectEditAccessModalVisible);
const targetId = computed(() => projectPageModalStore.state.targetId);

const state = reactive({
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

const handleSelectAccess = (accessType) => {
    state.selectedAccess = accessType;
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
        <template #confirm-button>
            {{ $t('PROJECT.LANDING.SAVE_CHANGES') }}
        </template>
        <template #body>
            <p-field-group :label="$t('PROJECT.DETAIL.ACCESS')"
                           required
            >
                <template #default>
                    <p-radio-group direction="vertical"
                                   class="w-full"
                    >
                        <p-radio :selected="state.selectedAccess"
                                 value="PRIVATE"
                                 @change="handleSelectAccess('PRIVATE')"
                        >
                            <p-i name="ic_lock-filled"
                                 class="mx-1"
                                 width="1rem"
                                 height="1rem"
                                 color="inherit"
                            />
                            <span class="option-label">{{ $t('PROJECT.LANDING.ONLY_PEOPLE_INVITED') }}</span>
                            <span class="option-description">{{ $t('PROJECT.LANDING.CAN_ACCESS_TO_THIS_PROJECT') }}</span>
                        </p-radio>
                        <p-radio :selected="state.selectedAccess"
                                 value="PUBLIC"
                                 @change="handleSelectAccess('PUBLIC')"
                        >
                            <p-i name="ic_globe-filled"
                                 class="mx-1"
                                 width="1rem"
                                 height="1rem"
                                 color="inherit"
                            />
                            <span class="option-label">{{ $t('PROJECT.LANDING.EVERYONE_AT_THIS_WORKSPACE') }}</span>
                            <span class="option-description">{{ $t('PROJECT.LANDING.CAN_ACCESS_TO_THIS_PROJECT') }}</span>
                        </p-radio>
                    </p-radio-group>
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.project-edit-access-modal {
    .option-label {
        @apply text-label-md font-medium;
    }
    .option-description {
        @apply text-gray-500 ml-1;
    }
}
</style>
