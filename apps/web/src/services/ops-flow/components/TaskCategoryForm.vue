<script setup lang="ts">
import {
    onBeforeMount, ref, watch, nextTick,
} from 'vue';

import {
    POverlayLayout, PFieldGroup, PTextInput, PTextarea, PButton,
} from '@cloudforet/mirinae';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const taskManagementPageGetters = taskManagementPageStore.getters;
const taskCategoryStore = useTaskCategoryStore();

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
        if (taskCategoryStore.getters.taskCategories.some((p) => taskManagementPageState.targetCategoryId !== p.category_id && p.name === value)) return 'Name already exists';
        return true;
    },
});

const loading = ref(false);
const handleCancelOrClose = () => {
    initForm();
    taskManagementPageStore.closeCategoryForm();
};
const handleClosed = () => {
    taskManagementPageStore.resetTargetCategoryId();
};
const handleConfirm = async () => {
    if (!isAllValid.value) return;

    try {
        loading.value = true;
        if (taskManagementPageState.targetCategoryId) {
            await taskCategoryStore.update({
                category_id: taskManagementPageState.targetCategoryId,
                name: name.value,
                description: description.value,
            });
        } else {
            if (!taskManagementPageGetters.defaultPackage) throw Error('Default package is not found');
            await taskCategoryStore.create({
                name: name.value,
                description: description.value,
                package_id: taskManagementPageGetters.defaultPackage.package_id,
            });
        }
        taskManagementPageStore.closeCategoryForm();
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to save category');
        // TODO: handle error
    } finally {
        loading.value = false;
    }
};

onBeforeMount(() => {
    if (taskManagementPageState.targetCategoryId) {
        const targetCategory = taskCategoryStore.getters.taskCategories.find((p) => p.category_id === taskManagementPageState.targetCategoryId);
        if (targetCategory) {
            setForm('name', targetCategory.name);
            setForm('description', targetCategory.description);
        }
    }
});

watch([() => taskManagementPageState.visibleCategoryForm, () => taskManagementPageGetters.targetCategory], async ([visible, targetCategory], [prevVisible]) => {
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
    <p-overlay-layout :title="taskManagementPageState.targetCategoryId ? 'Edit Category' : 'Add Category'"
                      :visible="taskManagementPageState.visibleCategoryForm"
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
