<script setup lang="ts">
import {
    onBeforeMount, toRef, ref, computed, watch, nextTick,
} from 'vue';

import {
    POverlayLayout, PFieldGroup, PTextInput, PTextarea, PSelectDropdown, PButton,
} from '@cloudforet/mirinae';

import type { PackageModel } from '@/schema/identity/package/model';

import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useWorkspaceField } from '@/services/ops-flow/composables/use-workspace-field';
import { useTaskManagementStore } from '@/services/ops-flow/stores/admin/task-management-store';

const workspaceReferenceStore = useWorkspaceReferenceStore();
const taskManagementStore = useTaskManagementStore();
const taskManagementState = taskManagementStore.state;
const taskManagementGetters = taskManagementStore.getters;
const packageStore = taskManagementStore.packageStore;
const taskCategoryStore = taskManagementStore.taskCategoryStore;



/* workspace */
const {
    selectedWorkspaceItems,
    workspaceMenuItemsHandler,
    workspaceValidator,
    handleUpdateSelectedWorkspaces,
    setInitialWorkspaces,
    applyPackageToWorkspaces,
} = useWorkspaceField({
    workspaceReferenceMap: toRef(workspaceReferenceStore.state, 'items'),
});

/* category */
const {
    selectedCategoryItems,
    categoryMenuItemsHandler,
    categoryValidator,
    handleUpdateSelectedCategories,
    setInitialCategories,
    applyPackageToCategories,
} = useCategoryField({
    defaultPackage: computed<PackageModel|undefined>(() => packageStore.state.packages?.find((p) => p.is_default)),
    taskCategoryStore,
});

/* form */
const {
    forms: {
        name, description,
    },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    resetValidations,
} = useFormValidator({
    name: '',
    description: '',
    categories: categoryValidator,
    workspaces: workspaceValidator,
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
        if (packageStore.state.packages?.some((p) => p.package_id !== taskManagementState.editTargetPackageId && p.name === value)) return 'Name already exists';
        return true;
    },
    description(value: string) {
        return value.length > 0 ? true : 'Description is required';
    },
});

/* modal */
const loading = ref(false);
const handleCancelOrClose = () => {
    taskManagementStore.closePackageForm();
};

const handleConfirm = async () => {
    if (!isAllValid.value) return;
    loading.value = true;
    if (taskManagementState.editTargetPackageId) {
        try {
            const updatedPackage = await packageStore.updatePackage({
                package_id: taskManagementState.editTargetPackageId,
                name: name.value,
                description: description.value,
                tags: {},
            });
            // bind workspaces and categories
            await Promise.all([
                applyPackageToWorkspaces(updatedPackage.package_id),
                applyPackageToCategories(updatedPackage.package_id),
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
                applyPackageToWorkspaces(createdPackage.package_id),
                applyPackageToCategories(createdPackage.package_id),
            ]);
        } catch (e) {
            ErrorHandler.handleRequestError(e, 'Failed to create package');
        }
    }
    taskManagementStore.closePackageForm();
    loading.value = false;
};

onBeforeMount(() => {
    workspaceReferenceStore.load();
});

watch([() => taskManagementState.visiblePackageForm, () => taskManagementGetters.editTargetPackage], async ([visible, targetPackage], [prevVisible]) => {
    if (!visible) {
        if (!prevVisible) return; // prevent initial call
        await nextTick(); // wait for closing animation
        setForm({
            name: '',
            description: '',
        });
        setInitialWorkspaces();
        setInitialCategories();
        resetValidations();
        return;
    }
    if (targetPackage) {
        setForm({
            name: targetPackage.name,
            description: targetPackage.description,
        });
        setInitialWorkspaces(targetPackage.package_id);
        setInitialCategories(targetPackage.package_id);
    }
});
</script>


<template>
    <p-overlay-layout title="Add Package"
                      :visible="taskManagementState.visiblePackageForm"
                      @close="handleCancelOrClose"
    >
        <template #default>
            <div class="p-6 w-full">
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
                <p-field-group :invalid="invalidState.workspaces"
                               :invalid-text="invalidTexts.workspaces"
                               label="Workspace"
                >
                    <div class="mt-2">
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
                               :invalid="invalidState.categories"
                               :invalid-text="invalidTexts.categories"
                >
                    <p-select-dropdown :selected="selectedCategoryItems"
                                       :handler="categoryMenuItemsHandler"
                                       :invalid="invalidState.categories"
                                       appearance-type="badge"
                                       show-select-marker
                                       multi-selectable
                                       use-fixed-menu-style
                                       block
                                       show-clear-selection
                                       is-filterable
                                       init-selected-with-handler
                                       @update:selected="handleUpdateSelectedCategories"
                    />
                </p-field-group>
            </div>
        </template>
        <template #footer>
            <div class="py-3 px-6 flex flex-wrap gap-3 justify-end">
                <p-button style-type="transparent"
                          :disabled="loading"
                          @click="handleCancelOrClose"
                >
                    Cancel
                </p-button>
                <p-button style-type="primary"
                          :loading="loading"
                          :disabled="!isAllValid"
                          @click="handleConfirm"
                >
                    Confirm
                </p-button>
            </div>
        </template>
    </p-overlay-layout>
</template>

