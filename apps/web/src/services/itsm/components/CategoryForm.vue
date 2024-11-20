<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import {
    POverlayLayout, PFieldGroup, PTextInput, PTextarea, PButton,
} from '@cloudforet/mirinae';

import { useFormValidator } from '@/common/composables/form-validator';

import { useTaskManagementPageStore } from '@/services/itsm/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const taskCategoryStore = taskManagementPageStore.taskCategoryStore;

const {
    forms: { name, description },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
} = useFormValidator({
    name: '',
    description: '',
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
        if (taskCategoryStore.getters.taskCategories.some((p) => taskManagementPageState.editTargetCategoryId !== p.category_id && p.name === value)) return 'Name already exists';
        return true;
    },
    description(value: string) {
        return value.length > 0 ? true : 'Description is required';
    },
});

const loading = ref(false);
const handleCancelOrClose = () => {
    initForm();
    taskManagementPageStore.closeCategoryForm();
};
const handleConfirm = async () => {
    if (!isAllValid.value) return;

    if (taskManagementPageState.editTargetCategoryId) {
        await taskCategoryStore.updateCategory({
            category_id: taskManagementPageState.editTargetCategoryId,
            name: name.value,
            description: description.value,
        });
    } else {
        await taskCategoryStore.createCategory({
            name: name.value,
            description: description.value,
        });
    }
    taskManagementPageStore.closeCategoryForm();
};

onBeforeMount(() => {
    if (taskManagementPageState.editTargetCategoryId) {
        const targetCategory = taskCategoryStore.getters.taskCategories.find((p) => p.category_id === taskManagementPageState.editTargetCategoryId);
        if (targetCategory) {
            setForm('name', targetCategory.name);
            setForm('description', targetCategory.description);
        }
    }
});

</script>

<template>
    <p-overlay-layout header-title="Add Category"
                      :visible="taskManagementPageState.visibleCategoryForm"
                      @close="handleCancelOrClose"
    >
        <template #contents>
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
