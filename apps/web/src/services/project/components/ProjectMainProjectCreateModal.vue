<script lang="ts" setup>
import { computed, reactive } from 'vue';
import VueI18n from 'vue-i18n';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';
import { isEmpty } from 'lodash';

import type { ProjectCreateParameters } from '@/schema/identity/project/api-verbs/create';
import type { ProjectModel } from '@/schema/identity/project/model';
import { i18n } from '@/translations';

import type { ProjectReferenceItem, ProjectReferenceMap } from '@/store/modules/reference/project/type';
import { useProjectStore } from '@/store/reference/project-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useProjectPageStore } from '@/services/project/stores/project-page-store';

import TranslateResult = VueI18n.TranslateResult;


interface Props {
    visible?: boolean;
    projectGroupId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectGroupId: '',
});
const emit = defineEmits<{(e: 'confirm'): void;
    (e: 'update:visible', visible?: boolean): void;
}>();

const projectStore = useProjectStore();
const projectPageStore = useProjectPageStore();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    projectName: undefined as string|undefined,
    projectNames: computed<string[]>(() => {
        const projectItems: ProjectReferenceMap = projectStore.getters.projectItems;
        if (isEmpty(projectItems)) return [];
        return Object.values(projectItems).map((project: ProjectReferenceItem) => project.name);
    }),
    projectNameInvalidText: computed(() => {
        let invalidText = '' as TranslateResult;
        if (typeof state.projectName === 'string') {
            if ((state.projectName.trim()).length === 0) {
                invalidText = i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_REQUIRED');
            } else if (state.projectName.length > 40) {
                invalidText = i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_LENGTH');
            } else if (state.projectNames.includes(state.projectName)) {
                invalidText = i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_DUPLICATED');
            }
        }
        return invalidText;
    }),
    isProjectNameValid: computed(() => {
        if (state.projectName) {
            return !(state.projectName.trim().length === 0 || state.projectName.trim().length > 40 || state.projectNames.includes(state.projectName));
        }
        return false;
    }),
    showValidation: false,
    loading: false,
});

const createProject = async (): Promise<ProjectModel|undefined> => {
    const params: ProjectCreateParameters = {
        name: state.projectName.trim(),
        project_type: 'PRIVATE', // TODO: project_type
    };
    if (props.projectGroupId) params.project_group_id = props.projectGroupId;
    return projectPageStore.createProject(params);
};

/* Event */
const confirm = async () => {
    if (state.loading) return;
    if (!state.showValidation) state.showValidation = true;
    if (!state.isProjectNameValid) return;

    state.loading = true;

    try {
        const project = await createProject();
        if (project) {
            state.proxyVisible = false;
            emit('confirm');
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
        state.showValidation = false;
    }
};
</script>

<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_TITLE')"
        centered
        size="sm"
        fade
        backdrop
        :visible.sync="state.proxyVisible"
        :disabled="state.loading || (state.showValidation && !state.isProjectNameValid)"
        @confirm="confirm"
    >
        <template #body>
            <p-field-group :label="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_LABEL')"
                           :invalid-text="state.projectNameInvalidText"
                           :invalid="state.showValidation && !state.isProjectNameValid"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input v-model="state.projectName"
                                  class="block w-full"
                                  :invalid="state.showValidation && invalid"
                                  :placeholder="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_PLACEHOLDER')"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>
