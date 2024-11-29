import { reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TaskCreateParameters } from '@/schema/opsflow/task/api-verbs/create';
import type { TaskDeleteParameters } from '@/schema/opsflow/task/api-verbs/delete';
import type { TaskGetParameters } from '@/schema/opsflow/task/api-verbs/get';
import type { TaskListParameters } from '@/schema/opsflow/task/api-verbs/list';
import type { TaskUpdateParameters } from '@/schema/opsflow/task/api-verbs/update';
import type { TaskModel } from '@/schema/opsflow/task/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

interface UseTaskTypeStoreState {
    itemsByTaskId: Record<string, TaskModel[]|undefined>;
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
            const categoryId = response.category_id;
            if (state.itemsByTaskId[categoryId]) {
                state.itemsByTaskId[categoryId]?.push(response);
            } else {
                state.itemsByTaskId[categoryId] = [response];
            }
        },
        async update(params: TaskUpdateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.task.update<TaskUpdateParameters, TaskModel>(params);
            const categoryId = response.category_id;
            const item = state.itemsByTaskId[categoryId]?.find((c) => c.category_id === categoryId);
            if (item) {
                Object.assign(item, response);
            }
            return response;
        },
        async get(taskId: string) {
            const response = await SpaceConnector.clientV2.opsflow.task.get<TaskGetParameters, TaskModel>({
                task_id: taskId,
            });
            const categoryId = response.category_id;
            const item = state.itemsByTaskId[categoryId]?.find((c) => c.category_id === categoryId);
            if (item) {
                Object.assign(item, response);
            }
            return response;
        },
        async delete(taskId: string) {
            const response = await SpaceConnector.clientV2.opsflow.task.delete<TaskDeleteParameters, TaskModel>({
                task_id: taskId,
            });
            const categoryId = response.category_id;
            state.itemsByTaskId[categoryId] = state.itemsByTaskId[categoryId]?.filter((item) => item.task_type_id !== taskId);
        },
    };

    const disposeSelf = () => {
        const store = useTaskStore();
        store.$dispose();
    };
    const appContextStore = useAppContextStore();
    watch(() => appContextStore.getters.isAdminMode, () => {
        disposeSelf();
    });
    return {
        ...actions,
    };
});
