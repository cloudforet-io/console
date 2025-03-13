import {
    reactive, onUnmounted,
} from 'vue';

import { defineStore } from 'pinia';

import type { TaskStatusType } from '@/api-clients/opsflow/task/schema/type';


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


export const useTaskCategoryPageStore = defineStore('task-category-page', () => {
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
        ...actions,
    };
});
