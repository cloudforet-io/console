<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown, PI,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { isEmpty } from 'lodash';

import type { ProjectCreateParameters } from '@/schema/identity/project/api-verbs/create';
import type { ProjectType } from '@/schema/identity/project/type';
import { i18n } from '@/translations';

import type { ProjectReferenceItem, ProjectReferenceMap } from '@/store/modules/reference/project/type';
import { useProjectStore } from '@/store/reference/project-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useProjectPageStore } from '@/services/project/stores/project-page-store';


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
    projectNames: computed<string[]>(() => {
        const projectItems: ProjectReferenceMap = projectStore.getters.projectItems;
        if (isEmpty(projectItems)) return [];
        return Object.values(projectItems).map((project: ProjectReferenceItem) => project.name);
    }),
    accessMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        {
            name: 'PRIVATE',
            label: i18n.t('PROJECT.LANDING.ONLY_PEOPLE_INVITED'),
            icon: 'ic_lock-filled',
        },
        {
            name: 'PUBLIC',
            label: i18n.t('PROJECT.LANDING.EVERYONE_AT_THIS_WORKSPACE'),
            icon: 'ic_globe-filled',
        },
    ])),
    selectedAccess: 'PRIVATE' as ProjectType,
    loading: false,
});
const {
    forms: { name },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
} = useFormValidator({
    name: undefined as string|undefined,
}, {
    name: (val: string) => {
        if (!val?.length) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_REQUIRED');
        if (val.length > 40) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_LENGTH');
        if (state.projectNames.includes(val)) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_DUPLICATED');
        return true;
    },
});

/* Event */
const confirm = async () => {
    if (state.loading) return;
    if (!isAllValid.value) return;

    state.loading = true;

    try {
        const params: ProjectCreateParameters = {
            name: name.value?.trim() as string,
            project_type: 'PRIVATE', // TODO: project_type
        };
        if (props.projectGroupId) params.project_group_id = props.projectGroupId;
        const project = await projectPageStore.createProject(params);
        if (project) {
            state.proxyVisible = false;
            emit('confirm');
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const handleSelectAccess = (selectedAccess: ProjectType) => {
    state.selectedAccess = selectedAccess;
};

watch(() => props.visible, (val) => {
    if (val) initForm();
});
</script>

<template>
    <p-button-modal
        class="project-main-project-create-modal"
        :header-title="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_TITLE')"
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
                           :invalid-text="invalidTexts.name"
                           :invalid="invalidState.name"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="name"
                                  class="block w-full"
                                  :invalid="invalid"
                                  :placeholder="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_PLACEHOLDER')"
                                  @update:value="setForm('name', $event)"
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
                            <p-i :name="state.selectedAccess === 'PRIVATE' ? 'ic_lock-filled' : 'ic_globe-filled'"
                                 width="1rem"
                                 height="1rem"
                            />
                            {{ state.selectedAccess === 'PRIVATE' ? $t('PROJECT.LANDING.ONLY_PEOPLE_INVITED') : $t('PROJECT.LANDING.EVERYONE_AT_THIS_WORKSPACE') }}
                        </template>
                    </p-select-dropdown>
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.project-main-project-create-modal {
    .access-dropdown {
        width: 100%;
    }
}
</style>
