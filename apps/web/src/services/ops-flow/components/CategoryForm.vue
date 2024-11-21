<script setup lang="ts">
import {
    onBeforeMount, ref, watch, nextTick,
} from 'vue';

import {
    POverlayLayout, PFieldGroup, PTextInput, PTextarea, PButton,
} from '@cloudforet/mirinae';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useTaskManagementStore } from '@/services/ops-flow/stores/admin/task-management-store';

const taskManagementStore = useTaskManagementStore();
const taskManagementState = taskManagementStore.state;
const taskManagementGetters = taskManagementStore.getters;
const taskCategoryStore = taskManagementStore.taskCategoryStore;

const {
    forms: { name, description },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
    resetValidations,
} = useFormValidator({
    name: '',
    description: '',
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
        if (taskCategoryStore.getters.taskCategories.some((p) => taskManagementState.editTargetCategoryId !== p.category_id && p.name === value)) return 'Name already exists';
        return true;
    },
});

const loading = ref(false);
const handleCancelOrClose = () => {
    initForm();
    taskManagementStore.closeCategoryForm();
};
const handleConfirm = async () => {
    if (!isAllValid.value) return;

    try {
        loading.value = true;
        if (taskManagementState.editTargetCategoryId) {
            await taskCategoryStore.updateCategory({
                category_id: taskManagementState.editTargetCategoryId,
                name: name.value,
                description: description.value,
            });
        } else {
            if (!taskManagementGetters.defaultPackage) throw Error('Default package is not found');
            await taskCategoryStore.createCategory({
                name: name.value,
                description: description.value,
                package_id: taskManagementGetters.defaultPackage.package_id,
            });
        }
        taskManagementStore.closeCategoryForm();
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to save category');
        // TODO: handle error
    } finally {
        loading.value = false;
    }
};

onBeforeMount(() => {
    if (taskManagementState.editTargetCategoryId) {
        const targetCategory = taskCategoryStore.getters.taskCategories.find((p) => p.category_id === taskManagementState.editTargetCategoryId);
        if (targetCategory) {
            setForm('name', targetCategory.name);
            setForm('description', targetCategory.description);
        }
    }
});

watch([() => taskManagementState.visibleCategoryForm, () => taskManagementGetters.editTargetCategory], async ([visible, targetCategory], [prevVisible]) => {
    if (!visible) {
        if (!prevVisible) return; // prevent initial call
        await nextTick(); // wait for closing animation
        setForm({
            name: '',
            description: '',
        });
        resetValidations();
        return;
    }
    if (targetCategory) {
        setForm({
            name: targetCategory.name,
            description: targetCategory.description,
        });
    }
});
</script>

<template>
    <p-overlay-layout title="Add Category"
                      :visible="taskManagementState.visibleCategoryForm"
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
                <p-field-group label="Description">
                    <p-textarea :value="description"
                                placeholder="Describe this support package in a few words."
                                @update:value="setForm('description', $event)"
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
