import type { ComputedRef, UnwrapRef } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';
import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/schema/opsflow/task/type';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/admin/task-type-store';

interface UseTaskCategoryPageStoreState {
    currentCategoryId?: string;
    // status
    visibleStatusForm: boolean;
    targetStatus: {
        statusId: string;
        type: TaskStatusType;
    }|undefined;
    visibleStatusDeleteModal: boolean;
    visibleSetDefaultStatusModal: boolean;
    // task type
    visibleTaskTypeForm: boolean;
    targetTaskTypeId?: string;
    visibleTaskTypeDeleteModal: boolean;
}

interface UseTaskCategoryPageStoreGetters {
    currentCategory: ComputedRef<TaskCategoryModel|undefined>;
    // status
    statusOptions: ComputedRef<TaskStatusOptions>;
    targetStatusOption: ComputedRef<{
            type: TaskStatusType;
            data: TaskStatusOption;
        }|undefined>;
    // task type
    taskTypes: ComputedRef<TaskTypeModel[]|undefined>;
    targetTaskType: ComputedRef<TaskTypeModel|undefined>;
}

export const useTaskCategoryPageStore = defineStore('task-management-category-page', () => {
    const taskCategoryStore = useTaskCategoryStore();
    const taskTypeStore = useTaskTypeStore();
    const state = reactive<UseTaskCategoryPageStoreState>({
        currentCategoryId: undefined,
        // status
        visibleStatusForm: false,
        targetStatus: undefined,
        visibleStatusDeleteModal: false,
        visibleSetDefaultStatusModal: false,
        // task type
        visibleTaskTypeForm: false,
        targetTaskTypeId: undefined,
        visibleTaskTypeDeleteModal: false,
    });

    const getters = reactive<UseTaskCategoryPageStoreGetters>({
        currentCategory: computed<TaskCategoryModel|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.currentCategoryId)),
        // status
        statusOptions: computed<TaskStatusOptions>(() => {
            const category = getters.currentCategory;
            if (!category) {
                return {
                    TODO: [],
                    IN_PROGRESS: [],
                    COMPLETED: [],
                };
            }
            return category.status_options;
        }),
        targetStatusOption: computed<{
            type: TaskStatusType;
            data: TaskStatusOption;
        }|undefined>(() => {
            if (!state.targetStatus) return undefined;
            const { statusId, type } = state.targetStatus;
            const statusOptions = getters.statusOptions;
            if (!statusOptions) return undefined;
            const data = statusOptions[type].find((status) => status.status_id === statusId);
            if (!data) return undefined;
            return {
                type,
                data,
            };
        }),
        // task type
        taskTypes: computed<TaskTypeModel[]|undefined>(() => {
            if (!state.currentCategoryId) return undefined;
            const allTaskTypes = taskTypeStore.getters.taskTypes;
            return allTaskTypes.filter((taskType) => taskType.category_id === state.currentCategoryId);
        }),
        targetTaskType: computed<TaskTypeModel|undefined>(() => {
            if (!state.targetTaskTypeId) return undefined;
            return taskTypeStore.getters.taskTypes.find((taskType) => taskType.task_type_id === state.targetTaskTypeId);
        }),
    }) as UnwrapRef<UseTaskCategoryPageStoreGetters>;

    const actions = {
        setCurrentCategoryId(categoryId: string) {
            state.currentCategoryId = categoryId;
        },
        // status
        openAddStatusForm() {
            state.targetStatus = undefined;
            state.visibleStatusForm = true;
        },
        openEditStatusForm(statusId: string, statusType: TaskStatusType) {
            state.targetStatus = {
                statusId,
                type: statusType,
            };
            state.visibleStatusForm = true;
        },
        closeStatusForm() {
            state.visibleStatusForm = false;
            // do not reset targetStatus here and handle it after the modal is closed
        },
        openDeleteStatusModal(statusId: string, statusType: TaskStatusType) {
            state.targetStatus = {
                statusId,
                type: statusType,
            };
            state.visibleStatusDeleteModal = true;
        },
        closeDeleteStatusModal() {
            state.visibleStatusDeleteModal = false;
            // do not reset targetStatus here and handle it after the modal is closed
        },
        openSetDefaultStatusModal(statusId: string, statusType: TaskStatusType) {
            state.targetStatus = {
                statusId,
                type: statusType,
            };
            state.visibleSetDefaultStatusModal = true;
        },
        closeSetDefaultStatusModal() {
            state.visibleSetDefaultStatusModal = false;
            // do not reset targetStatus here and handle it after the modal is closed
        },
        resetTargetStatus() {
            state.targetStatus = undefined;
        },
        // task type
        openAddTaskTypeForm() {
            state.targetTaskTypeId = undefined;
            state.visibleTaskTypeForm = true;
        },
        openEditTaskTypeForm(taskTypeId: string) {
            state.targetTaskTypeId = taskTypeId;
            state.visibleTaskTypeForm = true;
        },
        closeTaskTypeForm() {
            state.visibleTaskTypeForm = false;
            // do not reset targetTaskTypeId here and handle it after the modal is closed
        },
        openDeleteTaskTypeModal(taskTypeId: string) {
            state.targetTaskTypeId = taskTypeId;
            state.visibleTaskTypeDeleteModal = true;
        },
        closeDeleteTaskTypeModal() {
            state.visibleTaskTypeDeleteModal = false;
            // do not reset targetTaskTypeId here and handle it after the modal is closed
        },
        resetTargetTaskTypeId() {
            state.targetTaskTypeId = undefined;
        },
    };
    return {
        state,
        getters,
        ...actions,
        taskCategoryStore,
    };
});
