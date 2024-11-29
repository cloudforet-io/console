import type { ComputedRef } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';

interface UseBoardPageStoreGetters {
    currentCategory: ComputedRef<TaskCategoryModel|undefined>;
}
export const useBoardPageStore = defineStore('board-page', () => {
    const taskCategoryStore = useTaskCategoryStore();

    const state = reactive({
        currentCategoryId: '',
    });
    const getters: UseBoardPageStoreGetters = {
        currentCategory: computed<TaskCategoryModel|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.currentCategoryId)),
    };
    const actions = {
        setCurrentCategoryId(categoryId: string) {
            state.currentCategoryId = categoryId;
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
