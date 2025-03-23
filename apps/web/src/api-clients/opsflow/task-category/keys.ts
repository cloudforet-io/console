import type { TaskCategoryGetParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/get';
import type { TaskCategoryListParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/list';

export const taskCategoryKeys = {
    list: (params: TaskCategoryListParameters) => ['task-category', 'list', params] as const,
    get: (idParam: TaskCategoryGetParameters['category_id']) => ['task-category', 'get', idParam] as const,
};
