<script setup lang="ts">
import {
    ref, watch, nextTick,
} from 'vue';

import { isEqual } from 'lodash';

import {
    POverlayLayout, PFieldGroup, PTextInput, PTextarea, PSelectDropdown, PButton, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/src/controls/dropdown/select-dropdown/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useWorkspaceField } from '@/services/ops-flow/composables/use-workspace-field';
import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const taskManagementPageGetters = taskManagementPageStore.getters;
const packageStore = usePackageStore();



/* workspace */
const {
    selectedWorkspaceItems,
    workspaceMenuItemsHandler,
    workspaceValidator,
    setSelectedWorkspaces,
    setInitialWorkspaces,
    applyPackageToWorkspaces,
} = useWorkspaceField();
const workspaceType = ref<'unset'|'specific'>('unset');
const handleSelectUnsetWorkspace = () => {
    workspaceType.value = 'unset';
    setSelectedWorkspaces([]);
};
const handleUpdateWorkspaces = (items: SelectDropdownMenuItem[]) => {
    if (isEqual(items, selectedWorkspaceItems.value)) return;
    setSelectedWorkspaces(items);
};

/* category */
const {
    selectedCategoryItems,
    categoryMenuItemsHandler,
    categoryValidator,
    setSelectedCategoryItems,
    setInitialCategoriesByPackageId,
    applyPackageToCategories,
} = useCategoryField();

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
    name: '' as string,
    description: '' as string|undefined,
    categories: categoryValidator,
    workspaces: workspaceValidator,
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
        if (packageStore.getters.packages.some((p) => p.package_id !== taskManagementPageState.targetPackageId && p.name === value)) return 'Name already exists';
        return true;
    },
});

/* modal */
const loading = ref(false);
const handleCancelOrClose = () => {
    taskManagementPageStore.closePackageForm();
};
const handleClosed = () => {
    taskManagementPageStore.resetTargetPackageId();
};

const handleConfirm = async () => {
    if (!isAllValid.value) return;
    loading.value = true;
    if (taskManagementPageState.targetPackageId) {
        try {
            const updatedPackage = await packageStore.update({
                package_id: taskManagementPageState.targetPackageId,
                name: name.value,
                description: description.value,
            });
            // bind workspaces and categories
            const errorMessages: string[] = [];
            const responses = await Promise.allSettled([
                applyPackageToWorkspaces(updatedPackage.package_id, workspaceType.value === 'unset'),
                applyPackageToCategories(updatedPackage.package_id),
            ]);
            responses.forEach((response) => {
                if (response.status === 'rejected') {
                    errorMessages.push(response.reason.message);
                }
            });
            if (errorMessages.length) {
                throw new Error(errorMessages.join('\n'));
            }
            showSuccessMessage('Successfully updated the package', '');
        } catch (e) {
            ErrorHandler.handleRequestError(e, 'Failed to update package');
        }
    } else {
        try {
            const createdPackage = await packageStore.create({
                name: name.value,
                description: description.value,
                tags: {},
            });
            // bind workspaces and categories
            const errorMessages: string[] = [];
            const responses = await Promise.allSettled([
                applyPackageToWorkspaces(createdPackage.package_id, workspaceType.value === 'unset'),
                applyPackageToCategories(createdPackage.package_id),
            ]);
            responses.forEach((response) => {
                if (response.status === 'rejected') {
                    errorMessages.push(response.reason.message);
                }
            });
            if (errorMessages.length) {
                throw new Error(errorMessages.join('\n'));
            }
            showSuccessMessage('Successfully added the package', '');
        } catch (e) {
            ErrorHandler.handleRequestError(e, 'Failed to create package');
        }
    }
    taskManagementPageStore.closePackageForm();
    loading.value = false;
};

watch([() => taskManagementPageState.visiblePackageForm, () => taskManagementPageGetters.targetPackage], async ([visible, targetPackage], [prevVisible]) => {
    if (!visible) {
        if (!prevVisible) return; // prevent initial call
        await nextTick(); // wait for closing animation
        setForm({
            name: '',
            description: '',
        });
        workspaceType.value = 'unset';
        await setInitialWorkspaces();
        await setInitialCategoriesByPackageId();
        resetValidations();
        return;
    }
    if (targetPackage) {
        setForm({
            name: targetPackage.name,
            description: targetPackage.description,
        });
        await setInitialWorkspaces(targetPackage.package_id);
        if (selectedWorkspaceItems.value.length > 0) {
            workspaceType.value = 'specific';
        } else {
            workspaceType.value = 'unset';
        }
        await setInitialCategoriesByPackageId(targetPackage.package_id);
    }
});
</script>


<template>
    <p-overlay-layout title="Add Package"
                      :visible="taskManagementPageState.visiblePackageForm"
                      @close="handleCancelOrClose"
                      @closed="handleClosed"
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
                <p-field-group v-if="!taskManagementPageState.targetPackageId
                                   || taskManagementPageState.targetPackageId !== taskManagementPageGetters.defaultPackage?.package_id"
                               :invalid="invalidState.workspaces"
                               :invalid-text="invalidTexts.workspaces"
                               label="Workspace"
                >
                    <div class="mt-2">
                        <p-radio-group>
                            <p-radio :selected="workspaceType"
                                     value="unset"
                                     @change="handleSelectUnsetWorkspace"
                            >
                                Unset
                            </p-radio>
                            <p-radio :selected="workspaceType"
                                     value="specific"
                                     @change="workspaceType = $event"
                            >
                                Specific Workspaces
                            </p-radio>
                        </p-radio-group>
                        <p-select-dropdown v-if="workspaceType === 'specific'"
                                           class="mt-2"
                                           :selected="selectedWorkspaceItems"
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
                                           @update:selected="handleUpdateWorkspaces"
                        />
                    </div>
                </p-field-group>
                <p-field-group v-if="!taskManagementPageState.targetPackageId
                                   || taskManagementPageState.targetPackageId !== taskManagementPageGetters.defaultPackage?.package_id"
                               label="Category"
                               :invalid="invalidState.categories"
                               :invalid-text="invalidTexts.categories"
                >
                    <p-select-dropdown :selected="selectedCategoryItems"
                                       :handler="categoryMenuItemsHandler"
                                       :invalid="invalidState.categories"
                                       :page-size="10"
                                       appearance-type="badge"
                                       show-select-marker
                                       multi-selectable
                                       use-fixed-menu-style
                                       block
                                       show-clear-selection
                                       is-filterable
                                       init-selected-with-handler
                                       @update:selected="setSelectedCategoryItems"
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

