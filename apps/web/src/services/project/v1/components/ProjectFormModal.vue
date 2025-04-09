<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PI, PSelectDropdown, PTextInput,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ProjectCreateParameters } from '@/api-clients/identity/project/schema/api-verbs/create';
import type { ProjectUpdateParameters } from '@/api-clients/identity/project/schema/api-verbs/udpate';
import type { ProjectUpdateProjectTypeParameters } from '@/api-clients/identity/project/schema/api-verbs/update-project-type';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import type { ProjectType } from '@/api-clients/identity/project/schema/type';
import { i18n } from '@/translations';

import type { ProjectReferenceItem } from '@/store/reference/project-reference-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray, indigo } from '@/styles/colors';


interface Props {
    visible?: boolean;
    projectId?: string;
    projectGroupId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectId: undefined,
    projectGroupId: undefined,
});
const emit = defineEmits<{(e: 'confirm', isCreating: boolean, project?: ProjectModel): void;
    (e: 'update:visible', visible?: boolean): void;
}>();

const router = useRouter();
const projectStore = useProjectReferenceStore();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    projectNames: [] as string[],
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
    loading: false,
    isConfirmed: false,
});
const {
    forms: { projectName },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
} = useFormValidator({
    projectName: undefined as string|undefined,
}, {
    projectName: (val: string) => {
        if (state.isConfirmed) return true;
        if (!val?.length) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_REQUIRED');
        if (val.length > 40) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_LENGTH');
        if (state.projectNames.includes(val)) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_DUPLICATED');
        return true;
    },
});

/* Api */
const createProject = async (): Promise<ProjectModel|undefined> => {
    state.loading = true;
    try {
        const params: ProjectCreateParameters = {
            name: projectName.value?.trim() as string,
            project_type: state.selectedAccess,
            project_group_id: props.projectGroupId,
        };
        const res = await SpaceConnector.clientV2.identity.project.create<ProjectCreateParameters, ProjectModel>({
            ...params,
        });
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '');
        return res;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'));
        return undefined;
    } finally {
        state.loading = false;
    }
};
const updateProject = async (): Promise<ProjectModel|undefined> => {
    state.loading = true;
    try {
        const params: ProjectUpdateParameters = {
            project_id: props.projectId || router.currentRoute.params.id,
            name: projectName.value?.trim() as string,
        };
        const res = await SpaceConnector.clientV2.identity.project.update<ProjectUpdateParameters, ProjectModel>({
            ...params,
        });
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_PROJECT'), '');
        return res;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_PROJECT'));
        return undefined;
    } finally {
        state.loading = false;
    }
};
const updateProjectType = async (): Promise<ProjectModel|undefined> => {
    try {
        const params: ProjectUpdateProjectTypeParameters = {
            project_id: props.projectId || router.currentRoute.params.id,
            project_type: state.selectedAccess,
        };
        const res = await SpaceConnector.clientV2.identity.project.updateProjectType<ProjectUpdateProjectTypeParameters, ProjectModel>({
            ...params,
        });
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_PROJECT_TYPE'), '');
        return res;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_PROJECT_TYPE'));
        return undefined;
    }
};

/* Event */
const confirm = async () => {
    if (state.loading) return;
    if (!isAllValid.value) return;

    state.isConfirmed = true;

    if (props.projectId) { // update project
        const updatedProject1 = await updateProject();
        const updatedProject2 = await updateProjectType();
        if ((updatedProject1 && updatedProject2) || updatedProject2) {
            await projectStore.sync(updatedProject2);
            emit('confirm', false, updatedProject2);
        } else if (updatedProject1) {
            await projectStore.sync(updatedProject1);
            emit('confirm', false, updatedProject1);
        }
    } else { // create project
        const project = await createProject();
        if (project) {
            emit('confirm', true, project);
        }
    }
    state.proxyVisible = false;
};
const handleSelectAccess = (selectedAccess: ProjectType) => {
    state.selectedAccess = selectedAccess;
};

watch(() => state.proxyVisible, (visible) => {
    if (!visible) return;
    state.isConfirmed = false;
}, { immediate: true });
watch(() => props.projectId, async (projectId) => {
    if (!projectId) {
        initForm();
        return;
    }
    const project = projectStore.state.items ? projectStore.state.items[projectId] : undefined;
    if (project) {
        setForm('projectName', project?.name);
        state.selectedAccess = project?.data.projectType ?? 'PRIVATE';
    } else initForm();
}, { immediate: true });
watch(() => projectStore.state.items, (items) => {
    if (isEmpty(items)) return;
    const names = Object.values(items).filter((item) => item.key !== props.projectId).map((project: ProjectReferenceItem) => project.name);
    state.projectNames = names;
}, { immediate: true });
</script>

<template>
    <p-button-modal
        class="project-form-modal"
        :header-title="props.projectId ? $t('PROJECT.DETAIL.MODAL_UPDATE_PROJECT_TITLE') : $t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_TITLE')"
        centered
        size="sm"
        fade
        backdrop
        :visible.sync="state.proxyVisible"
        :disabled="state.loading || !isAllValid"
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
