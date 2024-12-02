<script setup lang="ts">
import {
    ref, nextTick, watch,
} from 'vue';

import { isEqual } from 'lodash';

import {
    POverlayLayout, PFieldGroup, PTextInput, PButton, PTextarea,
} from '@cloudforet/mirinae';

import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import {
    useTaskFieldsConfiguration,
} from '@/services/ops-flow/task-fields-configuration/composables/use-task-fields-configuration';
import TaskFieldsConfiguration from '@/services/ops-flow/task-fields-configuration/TaskFieldsConfiguration.vue';


const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskCategoryPageGetters = taskCategoryPageStore.getters;
const taskTypeStore = useTaskTypeStore();


/* task field configuration */
const {
    taskFieldsValidator,
    fields,
    setFields,
    addField,
    removeField,
    updateFieldValidation,
    setInitialFields,
} = useTaskFieldsConfiguration();

/* form validation */
const {
    forms: { name, description, assigneePool },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
    resetValidations,
} = useFormValidator({
    name: '',
    description: '',
    assigneePool: [] as string[],
    fields: taskFieldsValidator,
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
        if (!taskCategoryPageGetters.taskTypes) return true;
        const isDuplicated = taskCategoryPageGetters.taskTypes.some((taskType) => taskType.name === value && taskType.task_type_id !== taskCategoryPageGetters.targetTaskType?.task_type_id);
        if (isDuplicated) return 'Name already exists';
        return true;
    },
});

const loading = ref(false);
const handleCancelOrClose = () => {
    initForm();
    taskCategoryPageStore.closeTaskTypeForm();
};
const handleClosed = () => {
    taskCategoryPageStore.resetTargetTaskTypeId();
};

const updateTaskTypeFields = async (taskTypeId: string, categoryId: string) => {
    await taskTypeStore.updateFields({
        task_type_id: taskTypeId,
        fields: fields.value,
        category_id: categoryId,
        force: true,
    });
};

const createTaskType = async (categoryId: string) => {
    try {
        await taskTypeStore.create({
            name: name.value,
            description: description.value,
            assignee_pool: assigneePool.value,
            category_id: categoryId,
            fields: fields.value,
        });
        showSuccessMessage('Task type created successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to create task type');
    }
};
const updateTaskType = async (initialTaskType: TaskTypeModel) => {
    try {
        const promises: Promise<any>[] = [];
        if (initialTaskType.name !== name.value
            || initialTaskType.description !== description.value
            || !isEqual(initialTaskType.assignee_pool, assigneePool.value)
        ) {
            promises.push(taskTypeStore.update({
                task_type_id: initialTaskType.task_type_id,
                name: name.value,
                description: description.value,
                assignee_pool: assigneePool.value,
            }));
        }
        if (!isEqual(fields.value, initialTaskType.fields)) {
            promises.push(updateTaskTypeFields(initialTaskType.task_type_id, initialTaskType.category_id));
        }
        const result = await Promise.allSettled(promises);
        const errorMessages: string[] = [];
        result.forEach((res) => {
            if (res.status === 'rejected') {
                errorMessages.push(res.reason.message);
            }
        });
        if (errorMessages.length) {
            throw new Error(errorMessages.join('\n'));
        }
        showSuccessMessage('Task type updated successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to update task type');
    }
};

const handleConfirm = async () => {
    if (!isAllValid.value) return;
    try {
        if (!taskCategoryPageState.currentCategoryId) throw new Error('Category ID is not set');
        loading.value = true;
        if (taskCategoryPageGetters.targetTaskType) {
            await updateTaskType(taskCategoryPageGetters.targetTaskType);
        } else {
            await createTaskType(taskCategoryPageState.currentCategoryId);
        }
        taskCategoryPageStore.closeTaskTypeForm();
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        loading.value = false;
    }
};

watch([() => taskCategoryPageState.visibleTaskTypeForm, () => taskCategoryPageGetters.targetTaskType], async ([visible, target], [prevVisible]) => {
    if (!visible) {
        if (!prevVisible) return; // prevent initial call
        await nextTick(); // wait for closing animation
        setForm({
            name: '',
            description: '',
            assigneePool: [],
        });
        setInitialFields([]);
        resetValidations();
        return;
    }
    if (target) {
        setForm({
            name: target.name,
            description: target.description,
            assigneePool: target.assignee_pool,
        });
        setInitialFields(target.fields);
    }
});

</script>

<template>
    <p-overlay-layout :title="taskCategoryPageGetters.targetTaskType ? 'Edit Ticket Topic' : 'Add Ticket Topic'"
                      :visible="taskCategoryPageState.visibleTaskTypeForm"
                      size="lg"
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
                                      block
                                      @update:value="setForm('name', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group label="Assignee Pool">
                    <user-select-dropdown :selected-user-ids="assigneePool"
                                          selection-type="multiple"
                                          @update:user-ids="setForm('assigneePool', $event)"
                    />
                </p-field-group>
                <p-field-group label="Description">
                    <p-textarea :value="description"
                                placeholder="Describe this ticket type in a few words."
                                @update:value="setForm('description', $event)"
                    />
                </p-field-group>
                <p-field-group label="Fields Configuration"
                               required
                >
                    <task-fields-configuration class="mt-2"
                                               :fields="fields"
                                               @update:fields="setFields"
                                               @add-field="addField"
                                               @remove-field="removeField"
                                               @update-field-validation="updateFieldValidation"
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
