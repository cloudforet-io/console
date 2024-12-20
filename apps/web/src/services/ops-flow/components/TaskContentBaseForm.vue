<script setup lang="ts">
import { computed, watch } from 'vue';

import { isEqual } from 'lodash';

import {
    PFieldTitle, PFieldGroup, PSelectDropdown, PPaneLayout, PButton, PBadge,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';
import { i18n } from '@/translations';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useTaskStatusField } from '@/services/ops-flow/composables/use-task-status-field';
import { useTaskTypeField } from '@/services/ops-flow/composables/use-task-type-field';
import { useTaskAssignStore } from '@/services/ops-flow/stores/task-assign-store';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskContentFormGetters = taskContentFormStore.getters;
const userReferenceStore = useUserReferenceStore();
const taskAssignStore = useTaskAssignStore();
const taskStore = useTaskStore();
const taskDetailPageStore = useTaskDetailPageStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();
const userStore = useUserStore();

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
    if (isEqual(items, selectedTaskTypeItems)) return;
    setForm('taskType', items); // set form for validation
    await taskContentFormStore.setCurrentTaskType(items[0].name); // set current task type to store for other fields
    const taskType = taskContentFormState.currentTaskType;
    const category = taskContentFormGetters.currentCategory;
    if (items.length > 0 && !category) {
        ErrorHandler.handleError(new Error('Failed to get category'));
        return;
    }
    if (category && taskType) {
        initRelatedFieldsByTaskTypeSelection(category, taskType);
    }
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
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_UPDATE_TARGET', { target: i18n.t('OPSFLOW.STATUS') }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_UPDATE_TARGET', { target: i18n.t('OPSFLOW.STATUS') }));
    }
};
const handleUpdateSelectedStatus = async (items: SelectDropdownMenuItem[]) => {
    const statusId = items[0].name;
    if (taskContentFormState.statusId === statusId) return;
    taskContentFormStore.setStatusId(statusId);
    setSelectedStatusItems(items);
    if (taskContentFormState.mode === 'view') {
        await changeStatus(statusId);
        await taskDetailPageStore.loadNewEvents();
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
    return user?.label || user?.name || userId;
});

/* form validator */
const {
    invalidState,
    invalidTexts,
    isAllValid,
    resetValidation,
    resetValidations,
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
let hasInitiated = false;
watch([() => taskContentFormState.currentCategoryId, () => taskContentFormState.currentTaskType], async ([categoryId, taskType]) => {
    if (hasInitiated) return;

    if (taskContentFormState.mode === 'create' && categoryId) {
        await setInitialCategory(categoryId);
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

        // reset validations
        resetValidations();
    }

    hasInitiated = true;
}, { immediate: true });
</script>

<template>
    <component :is="taskContentFormState.mode === 'create' ? 'div' : PPaneLayout"
               class="flex flex-wrap gap-4"
               :class="taskContentFormState.mode === 'create' ? '' : 'py-6 px-4'"
    >
        <div class="base-form-top-wrapper">
            <div class="base-form-field-wrapper">
                <p-field-group :label="taskManagementTemplateStore.templates.TaskCategory"
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
                <p-field-group :label="taskManagementTemplateStore.templates.TaskType"
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
                <p-field-group :label="$t('OPSFLOW.STATUS')"
                               style-type="secondary"
                               required
                               :invalid="invalidState.status"
                               :invalid-text="invalidTexts.status"
                >
                    <p-select-dropdown :selected="selectedStatusItems"
                                       :handler="statusMenuItemsHandler"
                                       :invalid="invalidState.status"
                                       :readonly="!userStore.getters.isDomainAdmin || !taskContentFormGetters.currentCategory"
                                       block
                                       @update:selected="handleUpdateSelectedStatus"
                    >
                        <template #dropdown-button="item">
                            <p-badge badge-type="subtle"
                                     :style-type="item.color"
                            >
                                {{ item.label }}
                            </p-badge>
                        </template>
                        <template #menu-item--format="{ item }">
                            <p-badge badge-type="subtle"
                                     :style-type="item.color"
                            >
                                {{ item.label }}
                            </p-badge>
                        </template>
                    </p-select-dropdown>
                </p-field-group>
            </div>
            <div class="base-form-field-wrapper">
                <div v-if="taskContentFormState.mode === 'view'">
                    <div class="flex gap-2 items-center">
                        <p-field-title size="sm"
                                       color="gray"
                        >
                            {{ userStore.getters.isDomainAdmin ? $t('OPSFLOW.TASK_BOARD.ASSIGN_TO') : $t('OPSFLOW.ASSIGNEE') }}
                        </p-field-title>
                        <p-button v-if="userStore.getters.isDomainAdmin"
                                  size="sm"
                                  style-type="tertiary"
                                  @click="handleClickAssign"
                        >
                            {{ $t('OPSFLOW.TASK_BOARD.ASSIGN') }}
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
