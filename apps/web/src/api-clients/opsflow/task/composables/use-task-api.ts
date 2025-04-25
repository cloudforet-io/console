import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

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

export const useTaskApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.opsflow.task.create<TaskCreateParameters, TaskModel>,
        update: SpaceConnector.clientV2.opsflow.task.update<TaskUpdateParameters, TaskModel>,
        delete: SpaceConnector.clientV2.opsflow.task.delete<TaskDeleteParameters>,
        get: SpaceConnector.clientV2.opsflow.task.get<TaskGetParameters, TaskModel>,
        list: SpaceConnector.clientV2.opsflow.task.list<TaskListParameters, ListResponse<TaskModel>>,
        changeAssignee: SpaceConnector.clientV2.opsflow.task.changeAssignee<TaskChangeAssigneeParameters, TaskModel>,
        changeStatus: SpaceConnector.clientV2.opsflow.task.changeStatus<TaskChangeStatusParameters, TaskModel>,
        updateDescription: SpaceConnector.clientV2.opsflow.task.updateDescription<TaskUpdateDescriptionParameters, TaskModel>,
    };

    return {
        taskAPI: actions,
    };
};
