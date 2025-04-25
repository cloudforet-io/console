import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TaskCategoryCreateParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/create';
import type { TaskCategoryDeleteParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/delete';
import type { TaskCategoryGetParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/get';
import type { TaskCategoryListParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/list';
import type { TaskCategoryUpdateParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/update';
import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';

export const useTaskCategoryApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.opsflow.taskCategory.create<TaskCategoryCreateParameters, TaskCategoryModel>,
        update: SpaceConnector.clientV2.opsflow.taskCategory.update<TaskCategoryUpdateParameters, TaskCategoryModel>,
        delete: SpaceConnector.clientV2.opsflow.taskCategory.delete<TaskCategoryDeleteParameters>,
        get: SpaceConnector.clientV2.opsflow.taskCategory.get<TaskCategoryGetParameters, TaskCategoryModel>,
        list: SpaceConnector.clientV2.opsflow.taskCategory.list<TaskCategoryListParameters, ListResponse<TaskCategoryModel>>,
    };

    return {
        taskCategoryAPI: actions,
    };
};
