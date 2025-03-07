import { asyncComputed } from '@vueuse/core';
import {
    reactive, computed, onUnmounted, onMounted,
} from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';


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
    } as unknown as UseTaskCategoryPageStoreGetters;

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
