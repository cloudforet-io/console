import type { Tag } from '@/common/components/forms/tags-input-group/type';


export interface ProjectUpdateParameters {
    project_id: string;
    name?: string;
    tags?: Tag;
}
