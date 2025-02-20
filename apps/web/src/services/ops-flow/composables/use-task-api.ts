import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TaskChangeAssigneeParameters } from '@/api-clients/opsflow/task/schema/api-verbs/change-assignee';
import type { TaskChangeStatusParameters } from '@/api-clients/opsflow/task/schema/api-verbs/change-status';
import type { TaskCreateParameters } from '@/api-clients/opsflow/task/schema/api-verbs/create';
import type { TaskDeleteParameters } from '@/api-clients/opsflow/task/schema/api-verbs/delete';
import type { TaskGetParameters } from '@/api-clients/opsflow/task/schema/api-verbs/get';
import type { TaskListParameters } from '@/api-clients/opsflow/task/schema/api-verbs/list';
import type { TaskUpdateParameters } from '@/api-clients/opsflow/task/schema/api-verbs/update';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';


export const useTaskAPI = () => {
    const fetchList = getCancellableFetcher<TaskListParameters, ListResponse<TaskModel>>(SpaceConnector.clientV2.opsflow.task.list);
    const actions = {
        /*
         * @return {TaskModel[]|undefined} It returns undefined if the request is canceled.
         */
        async list(params: TaskListParameters = {}): Promise<TaskModel[] | undefined> {
            const result = await fetchList(params);
            if (result.status === 'succeed') {
                return result.response.results ?? [];
            }
            return undefined;
        },
        async create(params: TaskCreateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.task.create<TaskCreateParameters, TaskModel>(params);
            return response;
        },
        async update(params: TaskUpdateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.task.update<TaskUpdateParameters, TaskModel>(params);
            return response;
        },
        async get(taskId: string) {
            const response = await SpaceConnector.clientV2.opsflow.task.get<TaskGetParameters, TaskModel>({
                task_id: taskId,
            });
            return response;
        },
        async delete(taskId: string) {
            await SpaceConnector.clientV2.opsflow.task.delete<TaskDeleteParameters, TaskModel>({
                task_id: taskId,
            });
        },
        async changeStatus(taskId: string, statusId: string) {
            const response = await SpaceConnector.clientV2.opsflow.task.changeStatus<TaskChangeStatusParameters, TaskModel>({
                task_id: taskId,
                status_id: statusId,
            });
            return response;
        },
        async changeAssignee(taskId: string, assignee: string) {
            const response = await SpaceConnector.clientV2.opsflow.task.changeAssignee<TaskChangeAssigneeParameters, TaskModel>({
                task_id: taskId,
                assignee,
            });
            return response;
        },
    };

    return {
        ...actions,
    };
};
