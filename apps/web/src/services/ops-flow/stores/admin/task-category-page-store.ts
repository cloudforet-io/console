import type { ComputedRef, UnwrapRef } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/schema/opsflow/task/type';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';

interface UseTaskCategoryPageStoreState {
    currentCategoryId?: string;
    // status
    visibleStatusForm: boolean;
    targetStatus: {
        type: TaskStatusType;
        index: number;
    }|undefined;
    visibleStatusDeleteModal: boolean;
}

interface UseTaskCategoryPageStoreGetters {
    currentCategory: ComputedRef<TaskCategoryModel|undefined>;
    statusOptions: ComputedRef<TaskStatusOptions>;
    targetStatusOption: ComputedRef<{
            type: TaskStatusType;
            data: TaskStatusOption;
        }|undefined>;
}

export const useTaskCategoryPageStore = defineStore('task-management-category-page', () => {
    const taskCategoryStore = useTaskCategoryStore();
    const state = reactive<UseTaskCategoryPageStoreState>({
        currentCategoryId: undefined,
        // status
        visibleStatusForm: false,
        targetStatus: undefined,
        visibleStatusDeleteModal: false,
    }) as UseTaskCategoryPageStoreState;

    const getters = reactive<UseTaskCategoryPageStoreGetters>({
        currentCategory: computed<TaskCategoryModel|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.currentCategoryId)),
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
            const { index, type } = state.targetStatus;
            const statusOptions = getters.statusOptions;
            if (!statusOptions) return undefined;
            return {
                type,
                data: statusOptions[type][index],
            };
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
        openEditStatusForm(index: number, statusType: TaskStatusType) {
            state.targetStatus = {
                index,
                type: statusType,
            };
            state.visibleStatusForm = true;
        },
        closeStatusForm() {
            state.visibleStatusForm = false;
            state.targetStatus = undefined;
        },
        openDeleteStatusModal(index: number, statusType: TaskStatusType) {
            state.targetStatus = {
                index,
                type: statusType,
            };
            state.visibleStatusDeleteModal = true;
        },
        closeDeleteStatusModal() {
            state.visibleStatusDeleteModal = false;
            state.targetStatus = undefined;
        },
    };
    return {
        state,
        getters,
        ...actions,
        taskCategoryStore,
    };
});
