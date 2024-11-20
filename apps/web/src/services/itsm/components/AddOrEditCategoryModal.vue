<script setup lang="ts">
import { reactive, computed, onBeforeMount } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PTextarea, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useFormValidator } from '@/common/composables/form-validator';

import { useTaskManagementPageStore } from '@/services/itsm/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const taskCategoryStore = taskManagementPageStore.taskCategoryStore;
const packageStore = taskManagementPageStore.packageStore;

const {
    forms: { name, description, supportPackage },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
} = useFormValidator({
    name: '',
    description: '',
    supportPackage: packageStore.state.packages?.[0].package_id ?? '',
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
        if (taskCategoryStore.state.taskCategories?.some((p) => taskManagementPageState.editTargetCategoryId !== p.category_id && p.name === value)) return 'Name already exists';
        return true;
    },
    description(value: string) {
        return value.length > 0 ? true : 'Description is required';
    },
    supportPackage(value: string) {
        return value.length > 0 ? true : 'Support Package is required';
    },
});

const state = reactive({
    packageMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        if (!packageStore.state.packages) return [];
        return packageStore.state.packages.map((p) => ({
            name: p.package_id,
            label: p.name,
        }));
    }),
});

const handleCancelOrClose = () => {
    initForm();
    taskManagementPageStore.closeAddOrEditCategoryModal();
};
const handleConfirm = async () => {
    if (!isAllValid.value) return;

    if (taskManagementPageState.editTargetCategoryId) {
        await taskCategoryStore.updateCategory({
            category_id: taskManagementPageState.editTargetCategoryId,
            name: name.value,
            description: description.value,
            package_id: supportPackage.value,
        });
    } else {
        await taskCategoryStore.createCategory({
            name: name.value,
            description: description.value,
            package_id: supportPackage.value,
        });
    }
    taskManagementPageStore.closeAddOrEditCategoryModal();
};

onBeforeMount(() => {
    if (taskManagementPageState.editTargetCategoryId) {
        const targetCategory = taskCategoryStore.state.taskCategories?.find((p) => p.category_id === taskManagementPageState.editTargetCategoryId);
        if (targetCategory) {
            setForm('name', targetCategory.name);
            setForm('description', targetCategory.description);
            setForm('supportPackage', targetCategory.package_id);
        }
    }
});
</script>

<template>
    <p-button-modal header-title="Add Category"
                    :visible="taskManagementPageState.visibleAddOrEditCategoryModal"
                    :loading="taskCategoryStore.state.creating || taskCategoryStore.state.updating"
                    :disabled="!isAllValid"
                    @cancel="handleCancelOrClose"
                    @close="handleCancelOrClose"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group label="Name"
                           required
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
            >
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              @update:value="setForm('name', $event)"
                />
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
            <p-field-group label="Support Package"
                           required
            >
                <p-select-dropdown :selected="supportPackage"
                                   :menu="state.packageMenuItems"
                                   block
                                   :invalid="invalidState.supportPackage"
                                   :invalid-text="invalidTexts.supportPackage"
                                   @select="setForm('supportPackage', $event)"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>
