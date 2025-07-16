import type { ResourceType } from '@/api-clients/search/resource/schema/type';


export type ResourceModel = {
    resource_id: ResourceType;
    name: string;
    domain_id: string;
    workspace_id: string;
    project_id: string;
};
