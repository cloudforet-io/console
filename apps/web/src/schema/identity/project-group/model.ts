import type { Tags, TimeStamp } from '@/schema/_common/model';


export interface ProjectGroupModel {
    project_group_id: string;
    name: string;
    parent_project_group_info: null | ProjectGroupModel;
    domain_id: string;
    created_by: string;
    created_at: TimeStamp;
    tags: Tags;
}
