import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TaskTypeCreateParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/create';
import type { TaskTypeDeleteParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/delete';
import type { TaskTypeGetParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/get';
import type { TaskTypeListParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/list';
import type { TaskTypeUpdateParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/update';
import type { TaskTypeUpdateFieldsParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/update-fields';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';

export const useTaskTypeApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.opsflow.taskType.create<TaskTypeCreateParameters, TaskTypeModel>,
        update: SpaceConnector.clientV2.opsflow.taskType.update<TaskTypeUpdateParameters, TaskTypeModel>,
        delete: SpaceConnector.clientV2.opsflow.taskType.delete<TaskTypeDeleteParameters>,
        get: SpaceConnector.clientV2.opsflow.taskType.get<TaskTypeGetParameters, TaskTypeModel>,
        list: SpaceConnector.clientV2.opsflow.taskType.list<TaskTypeListParameters, ListResponse<TaskTypeModel>>,
        updateFields: SpaceConnector.clientV2.opsflow.taskType.updateFields<TaskTypeUpdateFieldsParameters, TaskTypeModel>,
    };

    return {
        taskTypeAPI: actions,
    };
};
