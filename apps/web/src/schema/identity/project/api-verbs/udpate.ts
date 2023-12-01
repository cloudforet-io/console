import type { Tag } from '@/common/components/forms/tags-input-group/type';


export interface ProjectUpdateRequestParameters {
    project_id: string;
    //
    name?: string;
    tags?: Tag;
    workspace_id?: string;
}
