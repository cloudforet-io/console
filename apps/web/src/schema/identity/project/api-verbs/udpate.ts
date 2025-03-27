import type { Tag } from '@/common/modules/tags/type';


export interface ProjectUpdateParameters {
    project_id: string;
    name?: string;
    tags?: Tag;
}
