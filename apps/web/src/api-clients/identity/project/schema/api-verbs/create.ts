import type { ProjectType } from '@/api-clients/identity/project/schema/type';

import type { Tag } from '@/common/modules/tags/type';


export interface ProjectCreateParameters {
    name: string;
    project_type: ProjectType;
    tags?: Tag;
    project_group_id?: string;
}
