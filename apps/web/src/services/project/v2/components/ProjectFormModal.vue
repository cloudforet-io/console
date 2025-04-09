<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PI, PSelectDropdown, PTextInput,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import type { ProjectType } from '@/api-clients/identity/project/schema/type';
import { i18n } from '@/translations';


import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { gray, indigo } from '@/styles/colors';

import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';


const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.projectFormModalVisible
&& projectPageModalStore.state.targetType === 'project');
const targetId = computed(() => projectPageModalStore.state.targetId);


const props = defineProps<{
    targetParentGroupId?: string;
}>();
const emit = defineEmits<{(e: 'created', projectGroupId: string): void;
}>();

const projectListStore = useProjectListStore();
const state = reactive({
    projectNames: computed(() => projectListStore.projects.filter((item) => item.key !== targetId.value).map((p) => p.name)),
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

/* form */
const {
    forms: { projectName },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm, resetValidations,
} = useFormValidator({
    projectName: undefined as string|undefined,
}, {
    projectName: (val?: string) => {
        if (!val?.length) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_REQUIRED');
        if (val.length > 40) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_LENGTH');
        if (state.projectNames.includes(val)) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_DUPLICATED');
        return true;
    },
});
const {
    data: project, isLoading, setQueryData, invalidateAllQueries,
} = useProjectQuery({
    projectId: targetId,
    enabled: visible,
});
watch([visible, project], ([v, prj]) => {
    if (!v) return;
    if (!prj) {
        initForm();
        return;
    }
    if (prj) {
        setForm('projectName', prj.name);
        state.selectedAccess = prj.project_type ?? 'PRIVATE';
        resetValidations();
    }
}, { immediate: true });

/* mutations */
const { projectAPI } = useProjectApi();
const { mutate: createProject, isPending: isCreatingProject } = useMutation({
    mutationFn: ({ projectType, groupId, name }: { projectType: ProjectType, groupId?: string; name: string }) => projectAPI.create({
        name,
        project_type: projectType,
        project_group_id: groupId,
    }),
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '');
        invalidateAllQueries();
        emit('created', data.project_id);
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'));
    },
});


const { mutateAsync: updateProject, isPending: isUpdatingProject } = useMutation({
    mutationFn: ({ projectId, name }: { projectId: string; name: string }) => projectAPI.update({
        project_id: projectId,
        name,
    }),
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_PROJECT'), '');
        setQueryData(data);
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_PROJECT'));
    },
});

const { mutateAsync: updateProjectType, isPending: isUpdatingProjectType } = useMutation({
    mutationFn: ({ projectId, projectType }: { projectId: string; projectType: ProjectType }) => projectAPI.updateProjectType({
        project_id: projectId,
        project_type: projectType,
    }),
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_PROJECT_TYPE'), '');
        setQueryData(data);
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_PROJECT_TYPE'));
    },
});
const isProcessing = computed(() => isCreatingProject.value || isUpdatingProject.value || isUpdatingProjectType.value);

/* Event */
const confirm = async () => {
    if (isProcessing.value) return;
    if (!isAllValid.value) return;

    const name = projectName.value?.trim() as string; // always exist
    if (targetId.value) {
        const promises: Promise<ProjectModel>[] = [];
        if (name !== project.value?.name) {
            promises.push(updateProject({
                projectId: targetId.value,
                name,
            }));
        }
        if (state.selectedAccess !== project.value?.project_type) {
            promises.push(updateProjectType({
                projectId: targetId.value,
                projectType: state.selectedAccess,
            }));
        }
        await Promise.allSettled(promises);
    } else {
        await createProject({
            name,
            projectType: state.selectedAccess,
            groupId: props.targetParentGroupId,
        });
    }
    projectPageModalStore.closeFormModal();
};
const handleSelectAccess = (selectedAccess) => {
    state.selectedAccess = selectedAccess as ProjectType;
};


</script>

<template>
    <p-button-modal class="project-form-modal"
                    :header-title="targetId ? $t('PROJECT.DETAIL.MODAL_UPDATE_PROJECT_TITLE') : $t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :loading-backdrop="isLoading"
                    :visible="visible"
                    :disabled="isProcessing || !isAllValid"
                    @close="projectPageModalStore.closeFormModal"
                    @cancel="projectPageModalStore.closeFormModal"
                    @closed="projectPageModalStore.resetTarget"
                    @confirm="confirm"
    >
        <template #body>
            <p-field-group :label="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_LABEL')"
                           :invalid-text="invalidTexts.projectName"
                           :invalid="invalidState.projectName"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="projectName"
                                  class="block w-full"
                                  :invalid="invalid"
                                  :placeholder="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_PLACEHOLDER')"
                                  @update:value="setForm('projectName', $event)"
                    />
                </template>
            </p-field-group>
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
.project-form-modal {
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
