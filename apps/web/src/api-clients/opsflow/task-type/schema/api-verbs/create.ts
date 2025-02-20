import type { Tags } from '@/api-clients/_common/schema/model';
import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';


export interface TaskTypeCreateParameters {
    name: string;
    description?: string;
    require_project?: boolean;
    fields?: TaskField[];
    assignee_pool?: string[];
    tags?: Tags;
    category_id: string;
}
