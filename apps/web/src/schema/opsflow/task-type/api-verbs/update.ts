import type { Tags } from '@/api-clients/_common/schema/model';

export interface TaskTypeUpdateParameters {
    task_type_id: string;
    name?: string;
    description?: string;
    assignee_pool?: string[];
    tags?: Tags;
    category_id?: string;
}
