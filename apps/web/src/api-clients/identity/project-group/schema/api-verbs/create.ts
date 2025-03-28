import type { Tag } from '@/common/modules/tags/type';

export interface ProjectGroupCreateParameters {
    name: string;
    tags?: Tag;
    parent_group_id?: string;
}
