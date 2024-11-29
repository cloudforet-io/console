import type { ComputedRef } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { TaskModel } from '@/schema/opsflow/task/model';

import { useTaskStore } from '@/services/ops-flow/stores/task-store';

interface UseTaskDetailPageStoreGetters {
    currentTask: ComputedRef<TaskModel|undefined>;
}
export const useTaskDetailPageStore = defineStore('task-detail-page', () => {
    const taskStore = useTaskStore();
    const state = reactive({
        currentTaskId: '',
    });
    const getters: UseTaskDetailPageStoreGetters = {
        currentTask: computed<TaskModel|undefined>(() => {
            if (!taskStore.state.itemsByTaskId[state.currentTaskId]) {
                taskStore.get(state.currentTaskId);
            }
            return taskStore.state.itemsByTaskId[state.currentTaskId];
        }),
    };
    const actions = {
        setCurrentTaskId(taskId: string) {
            state.currentTaskId = taskId;
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
