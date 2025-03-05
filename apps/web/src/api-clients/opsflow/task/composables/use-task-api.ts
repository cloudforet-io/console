import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TaskChangeAssigneeParameters } from '@/api-clients/opsflow/task/schema/api-verbs/change-assignee';
import type { TaskChangeStatusParameters } from '@/api-clients/opsflow/task/schema/api-verbs/change-status';
import type { TaskCreateParameters } from '@/api-clients/opsflow/task/schema/api-verbs/create';
import type { TaskDeleteParameters } from '@/api-clients/opsflow/task/schema/api-verbs/delete';
import type { TaskGetParameters } from '@/api-clients/opsflow/task/schema/api-verbs/get';
import type { TaskListParameters } from '@/api-clients/opsflow/task/schema/api-verbs/list';
import type { TaskUpdateParameters } from '@/api-clients/opsflow/task/schema/api-verbs/update';
import type { TaskUpdateDescriptionParameters } from '@/api-clients/opsflow/task/schema/api-verbs/update-description';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';

interface UseTaskApiReturn {
    taskQueryKey: ComputedRef<QueryKey>;
    taskListQueryKey: ComputedRef<QueryKey>;
    taskAPI: {
        create: (params: TaskCreateParameters) => Promise<TaskModel>;
        update: (params: TaskUpdateParameters) => Promise<TaskModel>;
        delete: (params: TaskDeleteParameters) => Promise<void>;
        get: (params: TaskGetParameters) => Promise<TaskModel>;
        list: (params: TaskListParameters) => Promise<ListResponse<TaskModel>>;
        changeAssignee: (params: TaskChangeAssigneeParameters) => Promise<TaskModel>;
        changeStatus: (params: TaskChangeStatusParameters) => Promise<TaskModel>;
        updateDescription: (params: TaskUpdateDescriptionParameters) => Promise<TaskModel>;
    }
}

export const useTaskApi = (): UseTaskApiReturn => {
    const taskQueryKey = useAPIQueryKey('opsflow/task/get');
    const taskListQueryKey = useAPIQueryKey('opsflow/task/list');

    const actions = {
        async create(params: TaskCreateParameters) {
            return SpaceConnector.clientV2.opsflow.task.create<TaskCreateParameters, TaskModel>(params);
        },
        async update(params: TaskUpdateParameters) {
            return SpaceConnector.clientV2.opsflow.task.update<TaskUpdateParameters, TaskModel>(params);
        },
        async delete(params: TaskDeleteParameters) {
            return SpaceConnector.clientV2.opsflow.task.delete<TaskDeleteParameters>(params);
        },
        async get(params: TaskGetParameters) {
            return SpaceConnector.clientV2.opsflow.task.get<TaskGetParameters, TaskModel>(params);
        },
        async list(params: TaskListParameters) {
            return SpaceConnector.clientV2.opsflow.task.list<TaskListParameters, ListResponse<TaskModel>>(params);
        },
        async changeAssignee(params: TaskChangeAssigneeParameters) {
            return SpaceConnector.clientV2.opsflow.task.changeAssignee<TaskChangeAssigneeParameters, TaskModel>(params);
        },
        async changeStatus(params: TaskChangeStatusParameters) {
            return SpaceConnector.clientV2.opsflow.task.changeStatus<TaskChangeStatusParameters, TaskModel>(params);
        },
        async updateDescription(params: TaskUpdateDescriptionParameters) {
            return SpaceConnector.clientV2.opsflow.task.updateDescription<TaskUpdateDescriptionParameters, TaskModel>(params);
        },
    };

    return {
        taskQueryKey,
        taskListQueryKey,
        taskAPI: actions,
    };
};
