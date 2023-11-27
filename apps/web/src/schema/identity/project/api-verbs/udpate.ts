import type { Tag } from '@/common/components/forms/tags-input-group/type';


export interface ProjectUpdateRequestParams {
    project_id: string;
    workspace_id: string;
    //
    name?: string;
    tags?: Tag;
}
