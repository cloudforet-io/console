import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TaskCategoryCreateParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/create';
import type { TaskCategoryDeleteParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/delete';
import type { TaskCategoryGetParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/get';
import type { TaskCategoryListParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/list';
import type { TaskCategoryUpdateParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/update';
import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';

interface UseTaskCategoryApiReturn {
    taskCategoryQueryKey: ComputedRef<QueryKey>;
    taskCategoryListQueryKey: ComputedRef<QueryKey>;
    taskCategoryAPI: {
        create: (params: TaskCategoryCreateParameters) => Promise<TaskCategoryModel>;
        update: (params: TaskCategoryUpdateParameters) => Promise<TaskCategoryModel>;
        delete: (params: TaskCategoryDeleteParameters) => Promise<void>;
        get: (params: TaskCategoryGetParameters) => Promise<TaskCategoryModel>;
        list: (params: TaskCategoryListParameters) => Promise<ListResponse<TaskCategoryModel>>;
    }
}

export const useTaskCategoryApi = (): UseTaskCategoryApiReturn => {
    const taskCategoryQueryKey = useAPIQueryKey('opsflow', 'task-category', 'get');
    const taskCategoryListQueryKey = useAPIQueryKey('opsflow', 'task-category', 'list');

    const actions = {
        async create(params: TaskCategoryCreateParameters) {
            return SpaceConnector.clientV2.opsflow.taskCategory.create<TaskCategoryCreateParameters, TaskCategoryModel>(params);
        },
        async update(params: TaskCategoryUpdateParameters) {
            return SpaceConnector.clientV2.opsflow.taskCategory.update<TaskCategoryUpdateParameters, TaskCategoryModel>(params);
        },
        async delete(params: TaskCategoryDeleteParameters) {
            return SpaceConnector.clientV2.opsflow.taskCategory.delete<TaskCategoryDeleteParameters>(params);
        },
        async get(params: TaskCategoryGetParameters) {
            return SpaceConnector.clientV2.opsflow.taskCategory.get<TaskCategoryGetParameters, TaskCategoryModel>(params);
        },
        async list(params: TaskCategoryListParameters) {
            return SpaceConnector.clientV2.opsflow.taskCategory.list<TaskCategoryListParameters, ListResponse<TaskCategoryModel>>(params);
        },
    };

    return {
        taskCategoryQueryKey,
        taskCategoryListQueryKey,
        taskCategoryAPI: actions,
    };
};
