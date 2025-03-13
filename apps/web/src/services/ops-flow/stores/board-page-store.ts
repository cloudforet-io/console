import type { ComputedRef } from 'vue';
import {
    reactive, computed, onUnmounted, onMounted,
} from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';

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

    onMounted(() => {
        if (!taskCategoryStore.state.loading) taskCategoryStore.list();
    });

    const disposeSelf = () => {
        const store = useBoardPageStore();
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
