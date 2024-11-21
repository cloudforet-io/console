import type { ComputedRef, UnwrapRef } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskStatusOptions } from '@/schema/opsflow/task/type';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';

interface UseTaskCategoryPageStoreState {
    currentCategoryId?: string;
}

interface UseTaskCategoryPageStoreGetters {
    currentCategory: ComputedRef<TaskCategoryModel|undefined>;
    statusOptions: ComputedRef<TaskStatusOptions>;
}

export const useTaskCategoryPageStore = defineStore('task-management-category-page', () => {
    const taskCategoryStore = useTaskCategoryStore();
    const state = reactive<UseTaskCategoryPageStoreState>({
        currentCategoryId: undefined,
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
    }) as UnwrapRef<UseTaskCategoryPageStoreGetters>;

    const actions = {
        setCurrentCategoryId(categoryId: string) {
            state.currentCategoryId = categoryId;
        },
    };
    return {
        state,
        getters,
        ...actions,
        taskCategoryStore,
    };
});
