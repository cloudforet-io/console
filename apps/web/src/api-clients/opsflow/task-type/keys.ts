import type { TaskTypeGetParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/get';
import type { TaskTypeListParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/list';

export const taskTypeKeys = {
    list: (params: TaskTypeListParameters) => ['task-type', 'list', params] as const,
    get: (idParam: TaskTypeGetParameters['task_type_id']) => ['task-type', 'get', idParam] as const,
};

