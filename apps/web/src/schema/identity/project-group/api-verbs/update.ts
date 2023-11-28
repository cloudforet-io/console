import type { Tag } from '@/common/components/forms/tags-input-group/type';


export interface ProjectGroupUpdateRequestParams {
    project_group_id: string;
    name?: string;
    tags?: Tag;
}
