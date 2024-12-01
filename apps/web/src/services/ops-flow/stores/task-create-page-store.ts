import type { ComputedRef } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

interface UseTaskCreatePageStoreGetters {
    currentCategory: ComputedRef<TaskCategoryModel|undefined>;
    currentTaskType: ComputedRef<TaskTypeModel|undefined>;
}
export const useTaskCreatePageStore = defineStore('task-create-page', () => {
    const taskCategoryStore = useTaskCategoryStore();
    const taskTypeStore = useTaskTypeStore();

    const state = reactive({
        currentCategoryId: undefined as string|undefined,
        currentTaskTypeId: undefined as string|undefined,
    });
    const getters: UseTaskCreatePageStoreGetters = {
        currentCategory: computed<TaskCategoryModel|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.currentCategoryId)),
        currentTaskType: computed<TaskTypeModel|undefined>(() => {
            if (!state.currentCategoryId || !state.currentTaskTypeId) return undefined;
            if (!taskTypeStore.state.itemsByCategoryId[state.currentCategoryId]) {
                taskTypeStore.listByCategoryId(state.currentCategoryId);
            }
            return taskTypeStore.state.itemsByCategoryId[state.currentCategoryId]?.find((t) => t.task_type_id === state.currentTaskTypeId);
        }),
    };
    const actions = {
        setCurrentCategoryId(categoryId?: string) {
            state.currentCategoryId = categoryId;
            state.currentTaskTypeId = undefined;
        },
        setCurrentTaskTypeId(taskTypeId?: string) {
            state.currentTaskTypeId = taskTypeId;
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
