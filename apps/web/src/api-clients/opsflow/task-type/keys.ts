import type { TaskTypeGetParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/get';
import type { TaskTypeListParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/list';

export const taskTypeKeys = {
    all: ['task-type'] as const,
    list: (params: TaskTypeListParameters) => [...taskTypeKeys.all, 'list', params] as const,
    get: (idParam: TaskTypeGetParameters['task_type_id']) => [...taskTypeKeys.all, 'get', idParam] as const,
};

