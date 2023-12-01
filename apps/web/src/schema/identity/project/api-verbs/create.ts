import type { ProjectType } from '@/schema/identity/project/type';

import type { Tag } from '@/common/components/forms/tags-input-group/type';


export interface ProjectCreateRequestParameters {
    name: string;
    project_type: ProjectType;
    //
    tags?: Tag;
    project_group_id?: string;
    workspace_id?: string;
}
