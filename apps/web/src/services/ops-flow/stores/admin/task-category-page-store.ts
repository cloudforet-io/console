import { asyncComputed } from '@vueuse/core';
import type { DeepReadonly } from 'vue';
import {
    reactive, computed, onUnmounted, onMounted,
} from 'vue';

import { defineStore } from 'pinia';

import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskAPI } from '@/services/ops-flow/composables/use-task-api';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

import type { TaskCategoryModel } from '@/api-clients/opsflow/task/schema-category/model';
import type { TaskTypeModel } from '@/api-clients/opsflow/task/schema-type/model';

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
    associatedTasksToTypeMap: Record<string, TaskModel[]>;
    loadingAssociatedTasksToType: boolean;
}

interface UseTaskCategoryPageStoreGetters {
    currentCategory: TaskCategoryModel|undefined;
    // status
    statusOptions: TaskStatusOptions;
    targetStatusOption: {
        type: TaskStatusType;
        data: TaskStatusOption;
    }|undefined;
    // task type
    taskTypes: TaskTypeModel[]|undefined;
    targetTaskType: TaskTypeModel|undefined;
    associatedTasksToType: TaskModel[];
}

export const useTaskCategoryPageStore = defineStore('task-category-page', () => {
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
        associatedTasksToTypeMap: {},
        loadingAssociatedTasksToType: false,
    });
    const getters: UseTaskCategoryPageStoreGetters = {
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
        taskTypes: asyncComputed<TaskTypeModel[]|undefined>(async () => {
            if (!state.currentCategoryId) return undefined;
            if (!taskTypeStore.state.itemsByCategoryId[state.currentCategoryId]) await taskTypeStore.listByCategoryId(state.currentCategoryId);
            return taskTypeStore.state.itemsByCategoryId[state.currentCategoryId];
        }, undefined, { lazy: true, onError: ErrorHandler.handleError }),
        targetTaskType: computed<TaskTypeModel|undefined>(() => {
            if (!state.targetTaskTypeId) return undefined;
            return getters.taskTypes?.find((taskType) => taskType.task_type_id === state.targetTaskTypeId);
        }),
        associatedTasksToType: computed<DeepReadonly<TaskModel[]>>(() => {
            if (!state.targetTaskTypeId) return [];
            const taskTypeId = state.targetTaskTypeId;
            return state.associatedTasksToTypeMap[taskTypeId] ?? [];
        }),
    } as unknown as UseTaskCategoryPageStoreGetters;

    const taskData = useTaskAPI();
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
        async loadAssociatedTasksToType(taskTypeId: string, force = false) {
            state.loadingAssociatedTasksToType = true;
            if (state.associatedTasksToTypeMap[taskTypeId] && !force) {
                state.loadingAssociatedTasksToType = false;
                return;
            }

            try {
                const tasks = await taskData.list({
                    task_type_id: taskTypeId,
                });
                if (!tasks) return; // canceled
                state.associatedTasksToTypeMap = {
                    ...state.associatedTasksToTypeMap,
                    [taskTypeId]: tasks,
                };
                state.loadingAssociatedTasksToType = false;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.loadingAssociatedTasksToType = false;
            }
        },
        async listTaskTypes() {
            try {
                if (!state.currentCategoryId) throw new Error('currentCategoryId is not set');
                const taskTypes = await taskTypeStore.listByCategoryId(state.currentCategoryId, true);
                return taskTypes;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        },
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

    onMounted(() => {
        if (!taskCategoryStore.state.loading) taskCategoryStore.list();
    });


    const disposeSelf = () => {
        const store = useTaskCategoryPageStore();
        store.$reset();
        store.$dispose();
    };
    onUnmounted(() => {
        disposeSelf();
    });
    return {
        state,
        getters,
        ...actions,
    };
});
