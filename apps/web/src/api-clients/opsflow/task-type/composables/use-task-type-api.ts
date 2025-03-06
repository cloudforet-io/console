import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TaskTypeCreateParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/create';
import type { TaskTypeDeleteParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/delete';
import type { TaskTypeGetParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/get';
import type { TaskTypeListParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/list';
import type { TaskTypeUpdateParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/update';
import type { TaskTypeUpdateFieldsParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/update-fields';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';

interface UseTaskTypeApiReturn {
    taskTypeQueryKey: ComputedRef<QueryKey>;
    taskTypeListQueryKey: ComputedRef<QueryKey>;
    taskTypeAPI: {
        create: (params: TaskTypeCreateParameters) => Promise<TaskTypeModel>;
        update: (params: TaskTypeUpdateParameters) => Promise<TaskTypeModel>;
        delete: (params: TaskTypeDeleteParameters) => Promise<void>;
        get: (params: TaskTypeGetParameters) => Promise<TaskTypeModel>;
        list: (params: TaskTypeListParameters) => Promise<ListResponse<TaskTypeModel>>;
        updateFields: (params: TaskTypeUpdateFieldsParameters) => Promise<TaskTypeModel>;
    }
}

export const useTaskTypeApi = (): UseTaskTypeApiReturn => {
    const taskTypeQueryKey = useAPIQueryKey('opsflow', 'task-type', 'get');
    const taskTypeListQueryKey = useAPIQueryKey('opsflow', 'task-type', 'list');

    const actions = {
        async create(params: TaskTypeCreateParameters) {
            return SpaceConnector.clientV2.opsflow.taskType.create<TaskTypeCreateParameters, TaskTypeModel>(params);
        },
        async update(params: TaskTypeUpdateParameters) {
            return SpaceConnector.clientV2.opsflow.taskType.update<TaskTypeUpdateParameters, TaskTypeModel>(params);
        },
        async delete(params: TaskTypeDeleteParameters) {
            return SpaceConnector.clientV2.opsflow.taskType.delete<TaskTypeDeleteParameters>(params);
        },
        async get(params: TaskTypeGetParameters) {
            return SpaceConnector.clientV2.opsflow.taskType.get<TaskTypeGetParameters, TaskTypeModel>(params);
        },
        async list(params: TaskTypeListParameters) {
            return SpaceConnector.clientV2.opsflow.taskType.list<TaskTypeListParameters, ListResponse<TaskTypeModel>>(params);
        },
        async updateFields(params: TaskTypeUpdateFieldsParameters) {
            return SpaceConnector.clientV2.opsflow.taskType.updateFields<TaskTypeUpdateFieldsParameters, TaskTypeModel>(params);
        },
    };

    return {
        taskTypeQueryKey,
        taskTypeListQueryKey,
        taskTypeAPI: actions,
    };
};
