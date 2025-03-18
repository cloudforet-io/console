import type { TaskCategoryGetParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/get';
import type { TaskCategoryListParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/list';

export const taskCategoryKeys = {
    all: ['task-category'],
    list: (params: TaskCategoryListParameters) => [...taskCategoryKeys.all, 'list', params],
    get: (idParam: TaskCategoryGetParameters['category_id']) => [...taskCategoryKeys.all, 'get', idParam],
};

