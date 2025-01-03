import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { TaskField } from '@/schema/opsflow/_types/task-field-type';

export interface TaskTypeCreateParameters {
    name: string;
    description?: string;
    scope?: Extract<ResourceGroupType, 'WORKSPACE' | 'PROJECT'>;
    fields?: TaskField[];
    assignee_pool?: string[];
    tags?: Tags;
    category_id: string;
}
