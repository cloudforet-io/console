import type { Tags } from '../../../_common/schema/model';
import type { TaskField } from '../../_types/task-field-type';
import type { TaskStatusOptions } from '../../task/schema/type';

export interface TaskCategoryModel {
    category_id: string;
    name: string;
    state: 'ACTIVE' | 'DELETED';
    description: string;
    status_options: TaskStatusOptions;
    fields:TaskField[];
    tags: Tags;
    package_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}
