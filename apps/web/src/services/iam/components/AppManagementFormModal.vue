<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown, PToggleButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { InputItem } from '@cloudforet/mirinae/types/controls/input/text-input/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { AppModel } from '@/api-clients/identity/app/schema/model';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { ProjectTreeNodeData } from '@/common/modules/project/project-tree-type';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import { getInputItemsFromTagKeys } from '@/services/iam/composables/tag-data';
import { APP_DROPDOWN_MODAL_TYPE } from '@/services/iam/constants/app-constant';
import { useAppPageStore } from '@/services/iam/store/app-page-store';


interface AppDropdownMenuItem extends SelectDropdownMenuItem {
    role_type?: string;
}

const appContextStore = useAppContextStore();
const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;

const emit = defineEmits<{(e: 'confirm', value?: AppModel): void;
}>();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isEdit: computed(() => appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.EDIT),
});
const state = reactive({
    activeProject: false,
    selectedProjects: [] as string[],
});
const formState = reactive({
    name: '',
    role: {} as AppDropdownMenuItem,
    tags: {} as Tags,
    selectedTags: [] as AppDropdownMenuItem[],
    searchText: '',
    selectedProjectId: computed<string|undefined>(() => (state.selectedProjects.length ? state.selectedProjects[0] : undefined)),
});
const dropdownState = reactive({
    visible: false,
    loading: false,
    searchText: '',
    menuItems: [] as AppDropdownMenuItem[],
    selectedMenuItems: [] as AppDropdownMenuItem[],
});
const validationState = reactive({
    isValid: true as undefined | boolean,
    invalidText: '' as TranslateResult | string,
});

/* Component */
const menuHandler = async (inputText: string) => {
    await fetchListRoles(inputText);
    return {
        results: dropdownState.menuItems,
    };
};
const handleClose = () => {
    appPageStore.$patch((_state) => {
        _state.modal.type = '';
        _state.modal.visible.form = false;
        _state.modal = cloneDeep(_state.modal);
    });
    initState();
};
const handleChangeInput = (event) => {
    formState.searchText = event.target.value;
    validationState.isValid = true;
    validationState.invalidText = '';
};
const handleEnterKey = () => {
    if (formState.searchText === '') return;
    if (!formState.searchText.includes(':') || formState.searchText.split(':').length > 2) {
        validationState.isValid = false;
        validationState.invalidText = i18n.t('IAM.ALT_E_TAG_FORMAT');
        return;
    }
    const isExistItem = formState.selectedTags.findIndex((item) => item.name === formState.searchText);
    if (isExistItem !== -1) {
        validationState.isValid = false;
        validationState.invalidText = i18n.t('IAM.ALT_E_TAG_DUPLICATION');
        return;
    }
    formState.selectedTags.push({ label: formState.searchText, name: formState.searchText });
    handleUpdateSelected();
    validationState.isValid = true;
    validationState.invalidText = '';
    formState.searchText = '';
};
const handleUpdateSelected = (items?: InputItem[]) => {
    if (items) formState.selectedTags = items;
    const refinedTags = formState.selectedTags.map((item) => {
        const tags = item.name.split(':').map((tag) => tag.trim());
        return { [tags[0]]: tags[1] };
    });

    formState.tags = Object.assign({}, ...refinedTags);
};
const handleSelectItem = (item: AppDropdownMenuItem) => {
    formState.role = item;
};
const setFormState = () => {
    formState.name = appPageStore.selectedApp.name;
    formState.tags = appPageStore.selectedApp.tags as Tags;
    formState.selectedTags = getInputItemsFromTagKeys(formState.tags);
};
const handleSelectedProject = (projectTreeNodeData: ProjectTreeNodeData[]) => {
    state.selectedProjects = projectTreeNodeData.map((item) => item.id);
};
const handleChangeProjectToggle = (value: boolean) => {
    state.activeProject = value;
    state.selectedProjects = [];
    dropdownState.searchText = '';
    dropdownState.selectedMenuItems = [];
};
const initState = () => {
    formState.name = '';
    formState.role = {} as AppDropdownMenuItem;
    formState.tags = {} as Tags;
    formState.selectedTags = [];
    formState.searchText = '';
    state.activeProject = false;
    state.selectedProjects = [];
    dropdownState.searchText = '';
    dropdownState.selectedMenuItems = [];
};

/* API */
const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);
const fetchListRoles = async (inputText: string) => {
    dropdownState.loading = true;
    let roleType = '';
    if (storeState.isAdminMode) {
        roleType = ROLE_TYPE.DOMAIN_ADMIN;
    } else if (!state.activeProject) {
        roleType = ROLE_TYPE.WORKSPACE_OWNER;
    } else {
        roleType = ROLE_TYPE.WORKSPACE_MEMBER;
    }
    roleListApiQueryHelper.setFilters([
        { k: 'role_type', v: [roleType], o: '=' },
        { k: 'state', v: ROLE_STATE.ENABLED, o: '=' },
    ]);
    if (inputText) {
        roleListApiQueryHelper.addFilter({
            k: 'name',
            v: inputText,
            o: '',
        });
    }

    try {
        const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
            query: {
                ...roleListApiQueryHelper.data,
                filter: [
                    ...(roleListApiQueryHelper.data?.filter || []),
                    { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                ],
            },
        });
        dropdownState.menuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } finally {
        dropdownState.loading = false;
    }
};
const handleConfirm = async () => {
    try {
        if (storeState.isEdit) {
            await appPageStore.updateApp({
                app_id: appPageStore.selectedApp.app_id,
                name: formState.name,
                tags: formState.tags,
            });
            emit('confirm');
        } else {
            const isProject = formState.selectedProjectId?.includes('project');
            const isProjectGroup = formState.selectedProjectId?.includes('pg');
            let resourceGroup:ResourceGroupType;
            if (storeState.isAdminMode) {
                resourceGroup = RESOURCE_GROUP.DOMAIN;
            } else {
                resourceGroup = (isProject || isProjectGroup) ? RESOURCE_GROUP.PROJECT : RESOURCE_GROUP.WORKSPACE;
            }

            const res = await appPageStore.createApp({
                name: formState.name,
                role_id: formState.role.name,
                tags: formState.tags,
                resource_group: resourceGroup,
                project_id: isProject ? formState.selectedProjectId : undefined,
                project_group_id: isProjectGroup ? formState.selectedProjectId : undefined,
            });
            emit('confirm', res);
            appPageStore.$patch((_state) => {
                _state.modal.visible.apiKey = true;
                _state.modal = cloneDeep(_state.modal);
            });
        }
        handleClose();
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};

/* Watcher */
watch(() => storeState.isEdit, (isEdit) => {
    if (isEdit) {
        setFormState();
    }
}, { immediate: true });
</script>

<template>
    <div>
        <p-button-modal class="app-management-form-modal"
                        :header-title="appPageState.modal.title"
                        size="sm"
                        :fade="true"
                        :backdrop="true"
                        :visible="appPageState.modal.visible.form"
                        :disabled="storeState.isEdit
                            ? formState.name === ''
                            : formState.name === '' || dropdownState.selectedMenuItems.length === 0 || (state.activeProject && state.selectedProjects.length === 0)"
                        :loading="appPageState.modal.loading"
                        @confirm="handleConfirm"
                        @cancel="handleClose"
                        @close="handleClose"
        >
            <template #body>
                <div class="form-contents">
                    <p-field-group :label="$t('IAM.APP.MODAL.COL_NAME')"
                                   class="input-form"
                                   required
                    >
                        <p-text-input v-model="formState.name"
                                      class="text-input"
                                      block
                        />
                    </p-field-group>
                    <p-field-group v-if="!storeState.isAdminMode && !storeState.isEdit"
                                   class="input-form"
                                   required
                    >
                        <template #label>
                            <div class="project-label">
                                <p>
                                    {{ $t('IAM.APP.MODAL.COL_PROJECT') }}
                                </p>
                                <p-toggle-button :value="state.activeProject"
                                                 class="project-toggle"
                                                 @change-toggle="handleChangeProjectToggle"
                                />
                            </div>
                        </template>
                        <project-select-dropdown
                            class="project-select-dropdown"
                            :selected-project-ids="state.selectedProjects"
                            project-selectable
                            :disabled="!state.activeProject"
                            is-init-selected-item
                            project-group-selectable
                            @select="handleSelectedProject"
                        />
                    </p-field-group>
                    <p-field-group v-if="!storeState.isEdit"
                                   :label="storeState.isAdminMode ? $t('IAM.APP.MODAL.COL_ADMIN_ROLE') : $t('IAM.APP.MODAL.COL_WORKSPACE_ROLE')"
                                   required
                                   class="input-form"
                    >
                        <p-select-dropdown use-fixed-menu-style
                                           :placeholder="$t('IAM.APP.MODAL.COL_ADMIN_ROLE_PLACEHOLDER')"
                                           :visible-menu.sync="dropdownState.visible"
                                           :loading="dropdownState.loading"
                                           :search-text.sync="dropdownState.searchText"
                                           :selected.sync="dropdownState.selectedMenuItems"
                                           :handler="menuHandler"
                                           is-filterable
                                           :multi-selectable="false"
                                           class="role-select-dropdown"
                                           @select="handleSelectItem"
                        >
                            <template #menu-item--format="{item}">
                                <div class="role-menu-item">
                                    <img :src="useRoleFormatter(item.role_type).image"
                                         alt="role-type-icon"
                                         class="role-type-icon"
                                    >
                                    <span>{{ item.label }}</span>
                                </div>
                            </template>
                        </p-select-dropdown>
                    </p-field-group>
                    <p-field-group :label="$t('IAM.APP.MODAL.COL_TAG')"
                                   :invalid-text="validationState.invalidText"
                                   :invalid="!validationState.isValid"
                                   class="input-form"
                    >
                        <p-text-input class="text-input"
                                      multi-input
                                      :invalid="!validationState.isValid"
                                      :selected="formState.selectedTags"
                                      appearance-type="stack"
                                      block
                                      @update:selected="handleUpdateSelected"
                        >
                            <input :placeholder="$t('IDENTITY.TAGS_PLACEHOLDER')"
                                   :value="formState.searchText"
                                   @input="handleChangeInput"
                                   @keyup.enter="handleEnterKey"
                            >
                        </p-text-input>
                    </p-field-group>
                </div>
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss">
.app-management-form-modal {
    display: initial;
    .form-contents {
        @apply flex flex-col;
        gap: 1rem;
        .input-form {
            margin-bottom: 0;
            .role-menu-item {
                @apply flex items-center;
                gap: 0.25rem;
                .role-type-icon {
                    @apply rounded-full;
                    width: 1rem;
                    height: 1rem;
                }
                .role-type {
                    @apply text-gray-500;
                }
            }
            .project-label {
                @apply flex items-center justify-between;
                width: 100%;
            }
        }
    }
    .project-select-dropdown {
        .p-select-dropdown {
            .dropdown-context-menu {
                min-width: 25.875rem !important;
            }
        }
    }
    .p-field-title .title-wrapper .title {
        width: 100%;
    }
}
</style>
