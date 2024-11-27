import { asyncComputed } from '@vueuse/core';
import type { Ref, UnwrapRef } from 'vue';
import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TaskTypeCreateParameters } from '@/schema/opsflow/task-type/api-verbs/create';
import type { TaskTypeDeleteParameters } from '@/schema/opsflow/task-type/api-verbs/delete';
import type { TaskTypeGetParameters } from '@/schema/opsflow/task-type/api-verbs/get';
import type { TaskTypeListParameters } from '@/schema/opsflow/task-type/api-verbs/list';
import type { TaskTypeUpdateParameters } from '@/schema/opsflow/task-type/api-verbs/update';
import type { TaskTypeUpdateFieldsParameters } from '@/schema/opsflow/task-type/api-verbs/update-fields';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UseTaskTypeStoreState {
    loading: boolean;
    items?: TaskTypeModel[];
}

interface UseTaskTypeStoreGetters {
    taskTypes: Ref<Readonly<TaskTypeModel[]>>
}

export const useTaskTypeStore = defineStore('task-type', () => {
    const state = reactive<UseTaskTypeStoreState>({
        loading: false,
        items: undefined,
    }) as UseTaskTypeStoreState;

    const getters = reactive<UseTaskTypeStoreGetters>({
        taskTypes: asyncComputed<TaskTypeModel[]>(async () => {
            if (!state.items) {
                await actions.list();
            }
            return state.items ?? [];
        }, [], { lazy: true }),
    }) as UnwrapRef<UseTaskTypeStoreGetters>;

    const fetchList = getCancellableFetcher<TaskTypeListParameters, ListResponse<TaskTypeModel>>(SpaceConnector.clientV2.opsflow.taskType.list);
    const actions = {
        async list(params: TaskTypeListParameters = {}) {
            state.loading = true;
            try {
                const result = await fetchList(params);
                if (result.status === 'succeed') {
                    state.items = result.response.results;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        },
        async create(params: TaskTypeCreateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.create<TaskTypeCreateParameters, TaskTypeModel>(params);
            state.items?.push(response);
        },
        async update(params: TaskTypeUpdateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.update<TaskTypeUpdateParameters, TaskTypeModel>(params);
            const item = state.items?.find((c) => c.category_id === response.category_id);
            if (item) {
                Object.assign(item, response);
            }
            return response;
        },
        async updateFields(params: TaskTypeUpdateFieldsParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.updateFields<TaskTypeUpdateFieldsParameters, TaskTypeModel>(params);
            const item = state.items?.find((c) => c.category_id === response.category_id);
            if (item) {
                Object.assign(item, response);
            }
            return response;
        },
        async get(taskTypeId: string) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.get<TaskTypeGetParameters, TaskTypeModel>({
                task_type_id: taskTypeId,
            });
            return response;
        },
        async delete(taskTypeId: string) {
            await SpaceConnector.clientV2.opsflow.taskType.delete<TaskTypeDeleteParameters, TaskTypeModel>({
                task_type_id: taskTypeId,
            });
            state.items = state.items?.filter((item) => item.task_type_id !== taskTypeId);
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
