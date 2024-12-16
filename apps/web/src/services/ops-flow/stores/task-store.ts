import { reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TaskChangeAssigneeParameters } from '@/schema/opsflow/task/api-verbs/change-assignee';
import type { TaskChangeStatusParameters } from '@/schema/opsflow/task/api-verbs/change-status';
import type { TaskCreateParameters } from '@/schema/opsflow/task/api-verbs/create';
import type { TaskDeleteParameters } from '@/schema/opsflow/task/api-verbs/delete';
import type { TaskGetParameters } from '@/schema/opsflow/task/api-verbs/get';
import type { TaskListParameters } from '@/schema/opsflow/task/api-verbs/list';
import type { TaskUpdateParameters } from '@/schema/opsflow/task/api-verbs/update';
import type { TaskModel } from '@/schema/opsflow/task/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

interface UseTaskTypeStoreState {
    itemsByTaskId: Record<string, TaskModel|undefined>;
}

export const useTaskStore = defineStore('task', () => {
    const state = reactive<UseTaskTypeStoreState>({
        itemsByTaskId: {},
    });

    const fetchList = getCancellableFetcher<TaskListParameters, ListResponse<TaskModel>>(SpaceConnector.clientV2.opsflow.task.list);
    const actions = {
        /*
         * @return {TaskModel[]|undefined} It returns undefined if the request is canceled.
         */
        async list(params: TaskListParameters = {}): Promise<TaskModel[]|undefined> {
            const result = await fetchList(params);
            if (result.status === 'succeed') {
                return result.response.results ?? [];
            }
            return undefined;
        },
        async create(params: TaskCreateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.task.create<TaskCreateParameters, TaskModel>(params);
            const taskId = response.task_id;
            state.itemsByTaskId = { ...state.itemsByTaskId, [taskId]: response };
            return response;
        },
        async update(params: TaskUpdateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.task.update<TaskUpdateParameters, TaskModel>(params);
            const taskId = response.task_id;
            state.itemsByTaskId = { ...state.itemsByTaskId, [taskId]: response };
            return response;
        },
        async get(taskId: string) {
            const response = await SpaceConnector.clientV2.opsflow.task.get<TaskGetParameters, TaskModel>({
                task_id: taskId,
            });
            state.itemsByTaskId = { ...state.itemsByTaskId, [taskId]: response };
            return response;
        },
        async delete(taskId: string) {
            await SpaceConnector.clientV2.opsflow.task.delete<TaskDeleteParameters, TaskModel>({
                task_id: taskId,
            });
            delete state.itemsByTaskId[taskId];
        },
        async changeStatus(taskId: string, statusId: string) {
            const response = await SpaceConnector.clientV2.opsflow.task.changeStatus<TaskChangeStatusParameters, TaskModel>({
                task_id: taskId,
                status_id: statusId,
            });
            state.itemsByTaskId = { ...state.itemsByTaskId, [taskId]: response };
            return response;
        },
        async changeAssignee(taskId: string, assignee: string) {
            const response = await SpaceConnector.clientV2.opsflow.task.changeAssignee<TaskChangeAssigneeParameters, TaskModel>({
                task_id: taskId,
                assignee,
            });
            state.itemsByTaskId = { ...state.itemsByTaskId, [taskId]: response };
            return response;
        },
        reset() {
            state.itemsByTaskId = {};
        },
    };

    const disposeSelf = () => {
        const store = useTaskStore();
        store.reset();
        store.$dispose();
    };
    const appContextStore = useAppContextStore();
    watch([() => appContextStore.getters.isAdminMode, () => appContextStore.getters.workspaceId], () => {
        disposeSelf();
    });
    return {
        state,
        ...actions,
    };
});
