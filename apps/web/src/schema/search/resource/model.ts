import type { ResourceType } from '@/schema/search/resource/type';


export type ResourceModel = {
    resource_id: ResourceType;
    name: string;
    domain_id: string;
    workspace_id: string;
    project_id: string;
};
