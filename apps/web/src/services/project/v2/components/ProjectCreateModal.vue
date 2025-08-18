<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PI, PSelectDropdown, PTextInput,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectType } from '@/api-clients/identity/project/schema/type';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { gray, indigo } from '@/styles/colors';

import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';


const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.projectCreateModalVisible);

const props = defineProps<{
    targetParentGroupId?: string;
}>();
const emit = defineEmits<{(e: 'created', projectGroupId: string): void;
}>();

const projectListStore = useProjectListStore();
const state = reactive({
    projectNames: computed(() => projectListStore.projects.map((p) => p.name)),
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
    initForm,
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
watch(visible, (v) => {
    if (!v) return;
    initForm();
    state.selectedAccess = 'PRIVATE';
});

/* mutations */
const queryClient = useQueryClient();
const { key: projectListQueryKey } = useServiceQueryKey('identity', 'project', 'list');
const { projectAPI } = useProjectApi();
const { mutate: createProject, isPending: isCreatingProject } = useMutation({
    mutationFn: ({ projectType, groupId, name }: { projectType: ProjectType, groupId?: string; name: string }) => projectAPI.create({
        name,
        project_type: projectType,
        project_group_id: groupId,
    }),
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '');
        queryClient.invalidateQueries({ queryKey: projectListQueryKey });
        emit('created', data.project_id);
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'));
    },
});

/* Event */
const confirm = async () => {
    if (isCreatingProject.value) return;
    if (!isAllValid.value) return;

    const name = projectName.value?.trim() as string;
    await createProject({
        name,
        projectType: state.selectedAccess,
        groupId: props.targetParentGroupId,
    });
    projectPageModalStore.closeProjectCreateModal();
};

const handleSelectAccess = (selectedAccess) => {
    state.selectedAccess = selectedAccess as ProjectType;
};

</script>

<template>
    <p-button-modal class="project-create-modal"
                    :header-title="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :visible="visible"
                    :loading="isCreatingProject"
                    :disabled="!isAllValid"
                    @close="projectPageModalStore.closeProjectCreateModal"
                    @cancel="projectPageModalStore.closeProjectCreateModal"
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
.project-create-modal {
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
