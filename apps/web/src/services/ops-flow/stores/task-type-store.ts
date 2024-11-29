import { reactive, watch } from 'vue';

import { merge } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TaskTypeCreateParameters } from '@/schema/opsflow/task-type/api-verbs/create';
import type { TaskTypeDeleteParameters } from '@/schema/opsflow/task-type/api-verbs/delete';
import type { TaskTypeGetParameters } from '@/schema/opsflow/task-type/api-verbs/get';
import type { TaskTypeListParameters } from '@/schema/opsflow/task-type/api-verbs/list';
import type { TaskTypeUpdateParameters } from '@/schema/opsflow/task-type/api-verbs/update';
import type { TaskTypeUpdateFieldsParameters } from '@/schema/opsflow/task-type/api-verbs/update-fields';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UseTaskTypeStoreState {
    itemsByCategoryId: Record<string, TaskTypeModel[]|undefined>;
}

export const useTaskTypeStore = defineStore('task-type', () => {
    const state = reactive<UseTaskTypeStoreState>({
        itemsByCategoryId: {},
    });

    const fetchList = getCancellableFetcher<TaskTypeListParameters, ListResponse<TaskTypeModel>>(SpaceConnector.clientV2.opsflow.taskType.list);
    const actions = {
        async listByCategoryId(categoryId: string, query?: Query, force?: boolean): Promise<TaskTypeModel[]> {
            if (!query && state.itemsByCategoryId[categoryId] && !force) {
                return state.itemsByCategoryId[categoryId] as TaskTypeModel[];
            }

            try {
                let _query: Query = { filter: [{ k: 'category_id', v: categoryId, o: 'eq' }] };
                if (query) {
                    _query = merge(query, _query);
                }
                const result = await fetchList({ query: _query });
                if (result.status === 'succeed') {
                    if (query) return result.response.results ?? [];
                    state.itemsByCategoryId[categoryId] = result.response.results;
                }
                return state.itemsByCategoryId[categoryId] ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
                return state.itemsByCategoryId[categoryId] ?? [];
            }
        },
        async create(params: TaskTypeCreateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.create<TaskTypeCreateParameters, TaskTypeModel>(params);
            const categoryId = response.category_id;
            if (state.itemsByCategoryId[categoryId]) {
                state.itemsByCategoryId[categoryId]?.push(response);
            } else {
                state.itemsByCategoryId[categoryId] = [response];
            }
        },
        async update(params: TaskTypeUpdateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.update<TaskTypeUpdateParameters, TaskTypeModel>(params);
            const categoryId = response.category_id;
            const item = state.itemsByCategoryId[categoryId]?.find((c) => c.category_id === categoryId);
            if (item) {
                Object.assign(item, response);
            }
            return response;
        },
        async updateFields(params: TaskTypeUpdateFieldsParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.updateFields<TaskTypeUpdateFieldsParameters, TaskTypeModel>(params);
            const categoryId = response.category_id;
            const item = state.itemsByCategoryId[categoryId]?.find((c) => c.category_id === categoryId);
            if (item) {
                Object.assign(item, response);
            }
            return response;
        },
        async get(taskTypeId: string) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.get<TaskTypeGetParameters, TaskTypeModel>({
                task_type_id: taskTypeId,
            });
            const categoryId = response.category_id;
            const item = state.itemsByCategoryId[categoryId]?.find((c) => c.category_id === categoryId);
            if (item) {
                Object.assign(item, response);
            }
            return response;
        },
        async delete(taskTypeId: string) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.delete<TaskTypeDeleteParameters, TaskTypeModel>({
                task_type_id: taskTypeId,
            });
            const categoryId = response.category_id;
            state.itemsByCategoryId[categoryId] = state.itemsByCategoryId[categoryId]?.filter((item) => item.task_type_id !== taskTypeId);
        },
    };

    const disposeSelf = () => {
        const store = useTaskTypeStore();
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
