import { SingleItemAction } from '@/lib/fluent-api/toolset';

export interface ProjectSummaryResp {
    member: number;
    server: number;
    // eslint-disable-next-line camelcase
    cloud_service: number;
    subnet: number;
}

export class ProjectSummary extends SingleItemAction<any, ProjectSummaryResp> {
    idField = 'project_id';

    path = '/project-summary'
}
