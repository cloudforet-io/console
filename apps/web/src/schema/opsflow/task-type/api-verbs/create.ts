import type { Tags } from '@/schema/_common/model';
import type { TaskField } from '@/schema/opsflow/_types/task-field-type';

export interface TaskTypeCreateParameters {
    name: string;
    description?: string;
    require_project?: boolean;
    fields?: TaskField[];
    assignee_pool?: string[];
    tags?: Tags;
    category_id: string;
}
