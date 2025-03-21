import type { TaskGetParameters } from '@/api-clients/opsflow/task/schema/api-verbs/get';
import type { TaskListParameters } from '@/api-clients/opsflow/task/schema/api-verbs/list';

export const taskKeys = {
    all: ['task'] as const,
    list: (params: TaskListParameters) => [...taskKeys.all, 'list', params] as const,
    get: (idParam: TaskGetParameters['task_id']) => [...taskKeys.all, 'get', idParam] as const,
};

