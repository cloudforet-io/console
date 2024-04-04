import type { Tag } from '@/common/components/forms/tags-input-group/type';


export interface ProjectGroupCreateParameters {
    name: string;
    tags?: Tag;
    parent_group_id?: string;
}
