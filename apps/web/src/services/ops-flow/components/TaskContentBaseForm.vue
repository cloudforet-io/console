<script setup lang="ts">
import { computed, watch } from 'vue';

import { isEqual } from 'lodash';

import {
    PFieldTitle, PFieldGroup, PSelectDropdown, PPaneLayout, PButton, PBadge, PSkeleton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import type { TaskStatusType } from '@/api-clients/opsflow/task/schema/type';
import { i18n } from '@/translations';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useTaskStatusField } from '@/services/ops-flow/composables/use-task-status-field';
import { useTaskTypeField } from '@/services/ops-flow/composables/use-task-type-field';
import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';
import { useTaskAssignStore } from '@/services/ops-flow/stores/task-assign-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

import { useCategoriesQuery } from '../composables/use-categories-query';

const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskContentFormGetters = taskContentFormStore.getters;
const userReferenceStore = useUserReferenceStore();
const taskAssignStore = useTaskAssignStore();
const taskDetailPageStore = useTaskDetailPageStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();
const userStore = useUserStore();
const taskCategoryStore = useTaskCategoryStore();


const isCreateMode = computed(() => taskContentFormState.mode.startsWith('create'));
const isMinimalCreateMode = computed(() => taskContentFormState.mode === 'create-minimal');

/* category field */
const { categories, isLoading: isCategoriesLoading } = useCategoriesQuery();
const {
    selectedCategoryItems,
    categoryValidator,
    categoryMenuItemsHandler,
    setInitialCategory,
} = useCategoryField({
    isRequired: true,
    hasTaskTypeOnly: true,
    categories,
});
const handleUpdateSelectedCategory = (items: SelectDropdownMenuItem[]) => {
    if (isEqual(items, selectedCategoryItems.value)) return;
    setForm('category', items); // set form for validation
    taskContentFormStore.setCurrentCategoryId(items[0].name); // set current category id to store for other fields
    const category = taskContentFormGetters.currentCategory;
    if (!category) {
        ErrorHandler.handleError(new Error('Failed to get category'));
        return;
    }
    initRelatedFieldsByCategorySelection(category);
};
const taskCategoryDesciprion = computed<string>(() => {
    if (!taskContentFormGetters.currentCategory) return '';
    return taskContentFormGetters.currentCategory.description;
});

/* task type field */
const {
    selectedTaskTypeItems,
    taskTypeValidator,
    taskTypeMenuItemsHandler,
    setInitialTaskType,
    taskTypesDropdownKey,
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
const taskTypeDescription = computed<string>(() => {
    if (!taskContentFormState.currentTaskType) return '';
    return taskContentFormState.currentTaskType.description;
});

/* status */
const { taskAPI } = useTaskApi();
const {
    selectedStatusItems,
    taskStatusValidator,
    statusMenuItemsHandler,
    setSelectedStatusItems,
    setInitialStatus,
} = useTaskStatusField({
    categoryId: computed(() => taskContentFormGetters.currentCategory?.category_id),
});
const getStatusTypeLabel = (statusType?: TaskStatusType) => (statusType ? TASK_STATUS_LABELS[statusType] : '--');
const changeStatus = async (statusId: string) => {
    try {
        if (!taskContentFormState.originTask) {
            throw new Error('Origin task is not defined');
        }
        await taskAPI.changeStatus({
            task_id: taskContentFormState.originTask.task_id,
            status_id: statusId,
        });
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
    if (!isCreateMode.value) { // only for view mode
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

let hasInitiated = false;

/* initiation for 'view' mode */
const initForViewMode = async (task?: TaskModel) => {
    if (hasInitiated) return;

    if (!task) return;
    // set category
    setInitialCategory(task.category_id);
    taskContentFormStore.setCurrentCategoryId(task.category_id);
    // set task type
    await taskContentFormStore.setCurrentTaskType(task.task_type_id);
    const taskType = taskContentFormState.currentTaskType;
    setInitialTaskType(taskType);
    // set status
    const category = await taskCategoryStore.get(task.category_id);
    if (category) {
        const statusOption = category.status_options[task.status_type]?.find((status) => status.status_id === task.status_id);
        setInitialStatus(statusOption);
    }

    hasInitiated = true;
};

/* initiation for 'create' mode with initial category, task type */
const initForCreateMode = async (categoryId?: string, taskType?: TaskTypeModel) => {
    if (hasInitiated) return;

    if (!categoryId) return;

    setInitialCategory(categoryId);
    // init selected status
    const category = taskContentFormGetters.currentCategory;
    if (category) {
        const defaultStatus = category.status_options.TODO.find((status) => status.is_default);
        setInitialStatus(defaultStatus);
        taskContentFormStore.setStatusId(defaultStatus?.status_id);
    } else {
        ErrorHandler.handleError(new Error('Failed to get category'));
        hasInitiated = true;
        return;
    }
    // init task type
    if (taskType) setInitialTaskType(taskType);

    // reset validations
    resetValidations();

    hasInitiated = true;
};

let viewModeInitWatchStop;
let createModeInitWatchStop;

viewModeInitWatchStop = watch([() => taskContentFormState.originTask, isCategoriesLoading], async ([task, categoriesLoading]) => {
    if (categoriesLoading) return; // wait for categories to be loaded

    if (hasInitiated && viewModeInitWatchStop) {
        viewModeInitWatchStop();
        viewModeInitWatchStop = null;
        return;
    }

    if (!isCreateMode.value) await initForViewMode(task);
}, { immediate: true });
createModeInitWatchStop = watch([() => taskContentFormState.currentCategoryId, () => taskContentFormState.currentTaskType, isCategoriesLoading], async ([categoryId, taskType, categoriesLoading]) => {
    if (categoriesLoading) return; // wait for categories to be loaded

    if (hasInitiated && createModeInitWatchStop) {
        createModeInitWatchStop();
        createModeInitWatchStop = undefined;
        return;
    }

    if (!isCreateMode.value) return;
    if (isMinimalCreateMode.value && !taskType) return; // minimal create is from landing page. task type is already selected and must be initialized.

    await initForCreateMode(categoryId, taskType);
}, { immediate: true });

</script>

<template>
    <component :is="isCreateMode ? 'div' : PPaneLayout"
               class="flex flex-wrap"
               :class="isCreateMode ? '' : 'py-6 px-4'"
    >
        <div v-if="!taskContentFormState.isArchivedTask"
             class="w-full"
        >
            <div class="base-form-top-wrapper">
                <div class="base-form-field-wrapper">
                    <p-field-group :label="taskManagementTemplateStore.templates.TaskCategory"
                                   :style-type="isCreateMode ? 'primary' : 'secondary'"
                                   required
                                   :invalid="isCreateMode && invalidState.category"
                                   :invalid-text="invalidTexts.category"
                    >
                        <template #default="{invalid}">
                            <p-select-dropdown :selected="selectedCategoryItems"
                                               :handler="categoryMenuItemsHandler"
                                               :page-size="10"
                                               :invalid="invalid"
                                               :readonly="!isCreateMode"
                                               block
                                               @update:selected="handleUpdateSelectedCategory"
                            />
                        </template>
                    </p-field-group>
                </div>
                <div class="base-form-field-wrapper">
                    <p-field-group :label="taskManagementTemplateStore.templates.TaskType"
                                   :style-type="isCreateMode ? 'primary' : 'secondary'"
                                   required
                                   :invalid="!isCreateMode && invalidState.taskType"
                                   :invalid-text="invalidTexts.taskType"
                    >
                        <template #default="{invalid}">
                            <p-select-dropdown :key="taskTypesDropdownKey"
                                               :selected="selectedTaskTypeItems"
                                               :handler="taskTypeMenuItemsHandler"
                                               :page-size="10"
                                               :invalid="invalid"
                                               :readonly="!isCreateMode || !taskContentFormGetters.currentCategory"
                                               block
                                               @update:selected="handleUpdateSelectedTaskType"
                            />
                        </template>
                    </p-field-group>
                </div>
            </div>
            <p class="min-h-5 text-label-md text-gray-600">
                {{ taskCategoryDesciprion }}
                {{ taskCategoryDesciprion && taskTypeDescription ? ' | ' : '' }}
                {{ taskTypeDescription }}
            </p>
        </div>
        <div v-if="!isCreateMode"
             class="base-form-top-wrapper"
        >
            <div class="base-form-field-wrapper">
                <p-field-group :label="$t('OPSFLOW.STATUS')"
                               style-type="secondary"
                               required
                               :invalid="invalidState.status"
                               :invalid-text="invalidTexts.status"
                >
                    <p-skeleton v-if="!taskContentFormState.hasTaskTypeLoaded"
                                height="2rem"
                    />
                    <template v-else-if="taskContentFormState.isArchivedTask">
                        {{ getStatusTypeLabel(taskContentFormState.originTask?.status_type) }}
                    </template>
                    <p-select-dropdown v-else
                                       :selected="selectedStatusItems"
                                       :handler="statusMenuItemsHandler"
                                       ::page-size="10"
                                       :invalid="invalidState.status"
                                       :readonly="!userStore.getters.isDomainAdmin || !taskContentFormGetters.currentCategory"
                                       block
                                       @update:selected="handleUpdateSelectedStatus"
                    >
                        <template #dropdown-button="item">
                            <p-badge v-if="item.label"
                                     badge-type="subtle"
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
                <div v-if="!isCreateMode">
                    <div class="flex gap-2 items-center">
                        <p-field-title size="sm"
                                       color="gray"
                        >
                            {{ userStore.getters.isDomainAdmin ? $t('OPSFLOW.TASK_BOARD.ASSIGN_TO') : $t('OPSFLOW.ASSIGNEE') }}
                        </p-field-title>
                        <p-button v-if="userStore.getters.isDomainAdmin && !taskContentFormState.isArchivedTask"
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
