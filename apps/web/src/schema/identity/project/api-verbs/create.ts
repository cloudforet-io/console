import type { ProjectType } from '@/schema/identity/project/type';

import type { Tag } from '@/common/modules/tags/type';


export interface ProjectCreateParameters {
    name: string;
    project_type: ProjectType;
    tags?: Tag;
    project_group_id?: string;
}
