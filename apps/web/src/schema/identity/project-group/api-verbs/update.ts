import type { Tag } from '@/common/modules/tags/type';

export interface ProjectGroupUpdateParameters {
    project_group_id: string;
    name?: string;
    tags?: Tag;
}
