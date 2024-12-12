<script setup lang="ts">
import { computed, watch } from 'vue';

import {
    PFieldTitle, PFieldGroup, PSelectDropdown, PPaneLayout, PButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useTaskStatusField } from '@/services/ops-flow/composables/use-task-status-field';
import { useTaskTypeField } from '@/services/ops-flow/composables/use-task-type-field';
import { useTaskAssignStore } from '@/services/ops-flow/stores/task-assign-store';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';

const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskContentFormGetters = taskContentFormStore.getters;
const userReferenceStore = useUserReferenceStore();
const taskAssignStore = useTaskAssignStore();
const taskStore = useTaskStore();

/* category */
const {
    selectedCategoryItems,
    categoryValidator,
    categoryMenuItemsHandler,
    setInitialCategory,
} = useCategoryField({
    isRequired: true,
    hasTaskTypeOnly: true,
});
const handleUpdateSelectedCategory = (items: SelectDropdownMenuItem[]) => {
    setForm('category', items); // set form for validation
    taskContentFormStore.setCurrentCategoryId(items[0].name); // set current category id to store for other fields
    const category = taskContentFormGetters.currentCategory;
    if (!category) {
        ErrorHandler.handleError(new Error('Failed to get category'));
        return;
    }
    initRelatedFieldsByCategorySelection(category);
};

/* task type */
const {
    selectedTaskTypeItems,
    taskTypeValidator,
    taskTypeMenuItemsHandler,
    setInitialTaskType,
} = useTaskTypeField({
    categoryId: computed(() => taskContentFormGetters.currentCategory?.category_id),
    isRequired: true,
});
const handleUpdateSelectedTaskType = async (items: SelectDropdownMenuItem[]) => {
    setForm('taskType', items); // set form for validation
    await taskContentFormStore.setCurrentTaskType(items[0].name); // set current task type to store for other fields
    const taskType = taskContentFormState.currentTaskType;
    const category = taskContentFormGetters.currentCategory;
    if (!category || !taskType) {
        ErrorHandler.handleError(new Error('Failed to get category or task type'));
        return;
    }
    initRelatedFieldsByTaskTypeSelection(category, taskType);
};

/* status */
const {
    selectedStatusItems,
    taskStatusValidator,
    statusMenuItemsHandler,
    setSelectedStatusItems,
    setInitialStatus,
} = useTaskStatusField({
    categoryId: computed(() => taskContentFormGetters.currentCategory?.category_id),
});
const changeStatus = async (statusId: string) => {
    try {
        if (!taskContentFormState.originTask) {
            throw new Error('Origin task is not defined');
        }
        await taskStore.changeStatus(taskContentFormState.originTask.task_id, statusId);
        showSuccessMessage('Status changed successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to change status');
    }
};
const handleUpdateSelectedStatus = (items) => {
    const statusId = items[0].name;
    if (taskContentFormState.statusId === statusId) return;
    taskContentFormStore.setStatusId(statusId);
    setSelectedStatusItems(items);
    if (taskContentFormState.mode === 'view') {
        changeStatus(statusId);
    }
};

/* assignee */
const handleClickAssign = () => {
    if (!taskContentFormState.currentTaskType) {
        ErrorHandler.handleError(new Error('Task type is not selected'));
        return;
    }
    if (!taskContentFormState.originTask) {
        ErrorHandler.handleError(new Error('Origin task is not defined'));
        return;
    }
    taskAssignStore.openAssignModal(taskContentFormState.originTask.task_id, taskContentFormState.originTask.assignee, taskContentFormState.currentTaskType.assignee_pool);
};
const assigneeName = computed<string>(() => {
    const userId = taskContentFormState.originTask?.assignee;
    if (!userId) return '--';
    const user = userReferenceStore.getters.userItems[userId];
    return user?.label || user?.name || '--';
});

/* form validator */
const {
    invalidState,
    invalidTexts,
    isAllValid,
    resetValidation,
    setForm,
} = useFormValidator({
    category: categoryValidator,
    taskType: taskTypeValidator,
    status: taskStatusValidator,
});
watch(isAllValid, (isValid) => {
    taskContentFormStore.setIsBaseFormValid(isValid);
}, { immediate: true });


/* form initiation */
const initRelatedFieldsByCategorySelection = (category: TaskCategoryModel) => {
    // init selected task type
    setInitialTaskType();
    // init selected status
    const defaultStatus = category.status_options.TODO.find((status) => status.is_default);
    setInitialStatus(defaultStatus);
    taskContentFormStore.setStatusId(defaultStatus?.status_id);
    // reset validations
    resetValidation('taskType');
};
const initRelatedFieldsByTaskTypeSelection = (category: TaskCategoryModel, taskType: TaskTypeModel) => {
    // init selected task type
    setInitialTaskType(taskType);
    // init selected status
    const defaultStatus = category.status_options.TODO.find((status) => status.is_default);
    setInitialStatus(defaultStatus);
    taskContentFormStore.setStatusId(defaultStatus?.status_id);
};

/* initiation for 'view' mode */
watch([() => taskContentFormState.originTask, () => taskContentFormGetters.currentCategory, () => taskContentFormState.currentTaskType], async ([task, category, taskType]) => {
    if (taskContentFormState.mode !== 'view' || !task || !category || !taskType) return;
    // set category
    setInitialCategory(task.category_id);
    // set task type
    setInitialTaskType(taskType);
    // set status
    const statusOption = category.status_options[task.status_type]?.find((status) => status.status_id === task.status_id);
    setInitialStatus(statusOption);
}, { immediate: true });

/* initiation for 'create' mode with initial category, task type */
const stopInitCreateWatch = watch([() => taskContentFormState.currentCategoryId, () => taskContentFormState.currentTaskType], ([categoryId, taskType]) => {
    if (taskContentFormState.mode === 'create' && categoryId) {
        setInitialCategory(categoryId);
        // init selected status
        const category = taskContentFormGetters.currentCategory;
        if (category) {
            const defaultStatus = category.status_options.TODO.find((status) => status.is_default);
            setInitialStatus(defaultStatus);
            taskContentFormStore.setStatusId(defaultStatus?.status_id);
        } else {
            ErrorHandler.handleError(new Error('Failed to get category'));
        }
        // init task type
        if (taskType) setInitialTaskType(taskType);

        // stop watching
        stopInitCreateWatch();
        return;
    }

    if (taskContentFormState.mode !== 'create') stopInitCreateWatch();
}, { immediate: true });
</script>

<template>
    <component :is="taskContentFormState.mode === 'create' ? 'div' : PPaneLayout"
               class="flex flex-wrap gap-4"
               :class="taskContentFormState.mode === 'create' ? '' : 'py-6 px-4'"
    >
        <div class="base-form-top-wrapper">
            <div class="base-form-field-wrapper">
                <p-field-group label="Category"
                               :style-type="taskContentFormState.mode === 'create' ? 'primary' : 'secondary'"
                               required
                               :invalid="invalidState.category"
                               :invalid-text="invalidTexts.category"
                >
                    <p-select-dropdown :selected="selectedCategoryItems"
                                       :handler="categoryMenuItemsHandler"
                                       :invalid="invalidState.category"
                                       :readonly="taskContentFormState.mode === 'view'"
                                       block
                                       @update:selected="handleUpdateSelectedCategory"
                    />
                </p-field-group>
            </div>
            <div class="base-form-field-wrapper">
                <p-field-group label="Type"
                               :style-type="taskContentFormState.mode === 'create' ? 'primary' : 'secondary'"
                               required
                               :invalid="invalidState.taskType"
                               :invalid-text="invalidTexts.taskType"
                >
                    <p-select-dropdown :selected="selectedTaskTypeItems"
                                       :handler="taskTypeMenuItemsHandler"
                                       :invalid="invalidState.taskType"
                                       :readonly="taskContentFormState.mode === 'view' || !taskContentFormGetters.currentCategory"
                                       block
                                       @update:selected="handleUpdateSelectedTaskType"
                    />
                </p-field-group>
            </div>
        </div>
        <div v-if="taskContentFormState.mode !== 'create'"
             class="base-form-top-wrapper"
        >
            <div class="base-form-field-wrapper">
                <p-field-group label="Status"
                               style-type="secondary"
                               required
                               :invalid="invalidState.status"
                               :invalid-text="invalidTexts.status"
                >
                    <p-select-dropdown :selected="selectedStatusItems"
                                       :handler="statusMenuItemsHandler"
                                       :invalid="invalidState.status"
                                       :readonly="!taskContentFormGetters.currentCategory"
                                       block
                                       @update:selected="handleUpdateSelectedStatus"
                    />
                </p-field-group>
            </div>
            <div class="base-form-field-wrapper">
                <div v-if="taskContentFormState.mode === 'view'">
                    <div class="flex gap-2 items-center">
                        <p-field-title size="sm"
                                       color="gray"
                        >
                            Assign to
                        </p-field-title>
                        <p-button size="sm"
                                  style-type="tertiary"
                                  @click="handleClickAssign"
                        >
                            Assign
                        </p-button>
                    </div>
                    <p class="mt-1 text-label-md text-blue-900">
                        {{ assigneeName }}
                    </p>
                </div>
            </div>
        </div>
    </component>
</template>

<style scoped lang="postcss">
.base-form-top-wrapper {
    @apply flex-1 flex mobile:flex-wrap gap-4;
}
.base-form-field-wrapper {
    @apply flex-1 min-w-40 mobile:min-w-full flex flex-col gap-1;
}
</style>
