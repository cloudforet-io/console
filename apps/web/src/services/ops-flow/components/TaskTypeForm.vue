<script setup lang="ts">
import {
    ref, onBeforeMount, nextTick, watch,
} from 'vue';


import {
    POverlayLayout, PFieldGroup, PTextInput, PSelectDropdown, PButton, PTextarea,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';


const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskCategoryPageGetters = taskCategoryPageStore.getters;


const {
    forms: { name, assigneePool, description },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
    resetValidations,
} = useFormValidator({
    name: '',
    assigneePool: [] as SelectDropdownMenuItem,
    description: '',
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
        return true;
    },
});

const loading = ref(false);
const handleCancelOrClose = () => {
    initForm();
    taskCategoryPageStore.closeTaskTypeForm();
};

const handleConfirm = async () => {
    if (!isAllValid.value) return;
    if (!taskCategoryPageState.currentCategoryId) return;
    try {
        loading.value = true;
        if (taskCategoryPageGetters.targetTaskType) {
            // await taskCategoryStore.update({
            //
            // });
        } else {
            // await taskCategoryStore.create({
            // });
        }
        taskCategoryPageStore.closeStatusForm();
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to save task type');
        // TODO: handle error
    } finally {
        loading.value = false;
    }
};

onBeforeMount(() => {
    if (taskCategoryPageGetters.targetTaskType) {
        const taskType = taskCategoryPageGetters.targetTaskType;
        setForm('name', taskType.name);
        setForm('assigneePool', taskType.assignee_pool);
        setForm('description', taskType.description);
    }
});

watch([() => taskCategoryPageState.visibleTaskTypeForm, () => taskCategoryPageGetters.targetTaskType], async ([visible, target], [prevVisible]) => {
    if (!visible) {
        if (!prevVisible) return; // prevent initial call
        await nextTick(); // wait for closing animation
        setForm({
            name: '',
            assigneePool: [],
            description: '',
        });
        resetValidations();
        return;
    }
    if (target) {
        setForm('name', target.name);
        setForm('assigneePool', target.assignee_pool);
        setForm('description', target.description);
    }
});

</script>

<template>
    <p-overlay-layout :title="taskCategoryPageGetters.targetTaskType ? 'Edit Ticket Topic' : 'Add Ticket Topic'"
                      :visible="taskCategoryPageState.visibleTaskTypeForm"
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
                                      block
                                      @update:value="setForm('name', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group label="Assignee Pool"
                               :invalid="!loading && invalidState.assigneePool"
                               :invalid-text="invalidTexts.assigneePool"
                >
                    <template #default="{ invalid }">
                        <p-select-dropdown :selected="assigneePool"
                                           :invalid="invalid"
                                           block
                        />
                    </template>
                </p-field-group>
                <p-field-group label="Description">
                    <p-textarea :value="description"
                                placeholder="Describe this ticket type in a few words."
                                @update:value="setForm('description', $event)"
                    />
                </p-field-group>
            </div>
        </template>
        <template #footer>
            <div class="py-3 px-6 flex flex-wrap gap-1 justify-end">
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
