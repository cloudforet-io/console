import type { TaskGetParameters } from '@/api-clients/opsflow/task/schema/api-verbs/get';
import type { TaskListParameters } from '@/api-clients/opsflow/task/schema/api-verbs/list';

export const taskKeys = {
    list: (params: TaskListParameters) => ['task', 'list', params] as const,
    get: (idParam: TaskGetParameters['task_id']) => ['task', 'get', idParam] as const,
};
