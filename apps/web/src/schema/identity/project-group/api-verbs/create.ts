import type { Tag } from '@/common/components/forms/tags-input-group/type';


export interface ProjectGroupCreateRequestParameters {
    name: string;
    tags?: Tag;
    parent_group_id?: string;
    workspace_id?: string;
}
