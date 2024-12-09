import { reactive } from 'vue';

import { defineStore } from 'pinia';

interface UseTaskAssignStoreState {
    taskId?: string;
    currentAssignee?: string;
    currentAssigneePool?: string[];
    visibleAssignModal: boolean;
}
export const useTaskAssignStore = defineStore('task-assign', () => {
    const state = reactive<UseTaskAssignStoreState>({
        taskId: undefined,
        currentAssignee: undefined,
        currentAssigneePool: undefined,
        visibleAssignModal: false,
    });
    const actions = {
        openAssignModal(taskId: string, assignee?: string, assigneePool?: string[]) {
            state.taskId = taskId;
            state.currentAssignee = assignee;
            state.currentAssigneePool = assigneePool;
            state.visibleAssignModal = true;
        },
        closeAssignModal(assignee?: string) {
            state.currentAssignee = assignee;
            state.visibleAssignModal = false;
        },
    };
    return {
        state,
        ...actions,
    };
});
