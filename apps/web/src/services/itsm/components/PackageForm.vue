<script setup lang="ts">
import {
    onBeforeMount, toRef, ref,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    POverlayLayout, PFieldGroup, PTextInput, PTextarea, PSelectButton, PSelectDropdown, PButton, PToggleButton,
} from '@cloudforet/mirinae';

import type { PackageModel } from '@/schema/identity/package/model';
import type { WorkspaceAddPackageParameters } from '@/schema/identity/workspace/api-verbs/add-package';
import type { WorkspaceRemovePackageParameters } from '@/schema/identity/workspace/api-verbs/remove-package';

import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCategoryField } from '@/services/itsm/composables/use-category-field';
import { useWorkspaceField } from '@/services/itsm/composables/use-workspace-field';
import { useTaskManagementPageStore } from '@/services/itsm/stores/admin/task-management-page-store';

const workspaceReferenceStore = useWorkspaceReferenceStore();
const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const packageStore = taskManagementPageStore.packageStore;
const taskCategoryStore = taskManagementPageStore.taskCategoryStore;



/* workspace */
const {
    WORKSPACE_SELECTION_TYPES,
    workspaceScopes,
    currentWorkspaceScope,
    selectedWorkspaceItems,
    workspaceMenuItemsHandler,
    workspaceValidator,
    selectedWorkspaceIds,
    handleChangeWorkspaceSelectionType,
    handleUpdateSelectedWorkspaces,
    setInitialWorkspaces,
} = useWorkspaceField({
    workspaceReferenceMap: toRef(workspaceReferenceStore.state, 'items'),
});

/* category */
const {
    categoryMenuItems,
    selectedCategoryItems,
    categoryValidator,
    handleUpdateSelectedCategories,
    categories,
} = useCategoryField({
    taskCategories: toRef(taskCategoryStore.state, 'taskCategories'),
});

/* form */
const {
    forms: {
        name, description,
    },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
} = useFormValidator({
    name: '',
    description: '',
    categories: categoryValidator,
    workspaces: workspaceValidator,
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
        if (packageStore.state.packages?.some((p) => p.package_id !== taskManagementPageState.editTargetPackageId && p.name === value)) return 'Name already exists';
        return true;
    },
    description(value: string) {
        return value.length > 0 ? true : 'Description is required';
    },
});

/* methods */
const addPackageToWorkspaces = async (supportPackage: PackageModel, workspaceIds: string[]) => {
    try {
        await Promise.allSettled([
            ...workspaceIds.map((workspaceId) => SpaceConnector.clientV2.identity.workspace.addPackage<WorkspaceAddPackageParameters>({
                package_id: supportPackage.package_id,
                workspace_id: workspaceId,
            })),
        ]);
    } catch (e) {
        // TODO: handle error
    }
};
const removePackageFromWorkspaces = async (supportPackage: PackageModel, workspaceIds: string[]) => {
    try {
        await Promise.allSettled([
            ...workspaceIds.map((workspaceId) => SpaceConnector.clientV2.identity.workspace.removePackage<WorkspaceRemovePackageParameters>({
                package_id: supportPackage.package_id,
                workspace_id: workspaceId,
            })),
        ]);
    } catch (e) {
        // TODO: handle error
    }
};
const applyPackageToWorkspaces = async (supportPackage: PackageModel, currentWorkspaceIds: string[], previousWorkspaceIds: string[]) => {
    try {
        const addedWorkspaces = currentWorkspaceIds.filter((id) => !previousWorkspaceIds.includes(id));
        const removedWorkspaces = previousWorkspaceIds.filter((id) => !currentWorkspaceIds.includes(id));
        await Promise.allSettled([
            addPackageToWorkspaces(supportPackage, addedWorkspaces),
            removePackageFromWorkspaces(supportPackage, removedWorkspaces),
        ]);
    } catch (e) {
        // TODO: handle error
    }
};

const updateCategories = async (supportPackage: PackageModel) => {
    try {
        await Promise.allSettled([
            ...categories.value.map((c) => taskCategoryStore.updateCategory({
                category_id: c,
                package_id: supportPackage.package_id,
            })),
        ]);
    } catch (e) {
        // TODO: handle error
    }
};

/* modal */
const loading = ref(false);
const handleCancelOrClose = () => {
    taskManagementPageStore.closePackageForm();
};

const handleConfirm = async () => {
    if (!isAllValid.value) return;
    loading.value = true;
    if (taskManagementPageState.editTargetPackageId) {
        try {
            await Promise.allSettled([
                packageStore.updatePackage({
                    package_id: taskManagementPageState.editTargetPackageId,
                    name: name.value,
                    description: description.value,
                    tags: {},
                }),
                ...categories.value.map((c) => taskCategoryStore.updateCategory({
                    category_id: c,
                    package_id: taskManagementPageState.editTargetPackageId,
                })),
            ]);
        } catch (e) {
            ErrorHandler.handleRequestError(e, 'Failed to update package');
        }
    } else {
        try {
            const createdPackage = await packageStore.createPackage({
                name: name.value,
                description: description.value,
                tags: {},
            });
            // bind workspaces and categories
            await Promise.all([
                applyPackageToWorkspaces(createdPackage, selectedWorkspaceIds.value, []),
                updateCategories(createdPackage),
            ]);
        } catch (e) {
            ErrorHandler.handleRequestError(e, 'Failed to create package');
        }
    }
    taskManagementPageStore.closePackageForm();
    loading.value = false;
};

onBeforeMount(() => {
    workspaceReferenceStore.load();
    if (taskManagementPageState.editTargetPackageId) {
        const targetPackage = packageStore.state.packages?.find((p) => p.package_id === taskManagementPageState.editTargetPackageId);
        if (targetPackage) {
            setForm({
                name: targetPackage.name,
                description: targetPackage.description,
            });
            setInitialWorkspaces(targetPackage.package_id);
            // TODO: set initial categories
        }
    }
});
/*
 <p-overlay-layout :visible="props.visible"
                      style-type="secondary"
                      size="full"
                      :title="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.TITLE')"
                      class="dashboard-manage-variable-overlay"
                      @close="handleCloseOverlay"
    >

    :loading="loading"
                    :disabled="!isAllValid"
                    @confirm="handleConfirm"
 */
</script>


<template>
    <p-overlay-layout header-title="Add Package"
                      :visible="taskManagementPageState.visiblePackageForm"
                      @close="handleCancelOrClose"
    >
        <template #contents>
            <p-field-group label="Name"
                           required
                           :invalid="!loading && invalidState.name"
                           :invalid-text="invalidTexts.name"
            >
                <template #default="{ invalid }">
                    <p-text-input :value="name"
                                  :invalid="invalid"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group label="Description"
                           required
                           :invalid="invalidState.description"
                           :invalid-text="invalidTexts.description"
            >
                <p-textarea :value="description"
                            :invalid="invalidState.description"
                            placeholder="Describe this support package in a few words."
                            @update:value="setForm('description', $event)"
                />
            </p-field-group>
            <p-field-group required
                           :invalid="invalidState.workspaces"
                           :invalid-text="invalidTexts.workspaces"
                           label="Workspace Scope"
            >
                <div class="flex flex-wrap gap-2">
                    <p-select-button v-for="type in workspaceScopes"
                                     :key="type"
                                     :value="type"
                                     :selected="currentWorkspaceScope"
                                     @change="handleChangeWorkspaceSelectionType"
                    >
                        {{ WORKSPACE_SELECTION_TYPES[type].label }}
                    </p-select-button>
                </div>
                <div v-if="currentWorkspaceScope === 'specific'"
                     class="mt-2"
                >
                    <p-select-dropdown :selected="selectedWorkspaceItems"
                                       :invalid="invalidState.workspaces"
                                       :handler="workspaceMenuItemsHandler"
                                       :page-size="10"
                                       appearance-type="badge"
                                       menu-position="left"
                                       show-select-marker
                                       multi-selectable
                                       use-fixed-menu-style
                                       block
                                       show-clear-selection
                                       is-filterable
                                       init-selected-with-handler
                                       @update:selected="handleUpdateSelectedWorkspaces"
                    />
                </div>
            </p-field-group>
            <p-field-group label="Category"
                           class="pb-6"
                           required
                           :invalid="invalidState.categories"
                           :invalid-text="invalidTexts.categories"
            >
                <p-select-dropdown :selected="selectedCategoryItems"
                                   :menu="categoryMenuItems"
                                   :invalid="invalidState.categories"
                                   appearance-type="badge"
                                   show-select-marker
                                   multi-selectable
                                   use-fixed-menu-style
                                   block
                                   show-clear-selection
                                   @update:selected="handleUpdateSelectedCategories"
                />
            </p-field-group>
            <p-field-group label="Set as Default Package"
                           class="pb-6"
                           required
                           :invalid="invalidState.categories"
                           :invalid-text="invalidTexts.categories"
            >
                <p-toggle-button v-model="isDefaultPackage" />
            </p-field-group>
        </template>
        <template #footer>
            <p-button style-type="transparent"
                      :disabled="loading"
                      @click="handleCancelOrClose"
            >
                Cancel
            </p-button>
            <p-button class="ml-3"
                      style-type="primary"
                      :loading="loading"
                      :disabled="!isAllValid"
                      @click="handleConfirm"
            >
                Confirm
            </p-button>
        </template>
    </p-overlay-layout>
</template>

