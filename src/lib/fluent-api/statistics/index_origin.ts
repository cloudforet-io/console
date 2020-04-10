/* eslint-disable camelcase */
import { Service, SingleItemAction } from '@/lib/fluent-api/toolset';

export interface ProjectSummaryResp {
    member: number;
    server: number;
    cloud_service: number;
    subnet: number;
}

class ProjectSummary extends SingleItemAction<any, ProjectSummaryResp> {
    idField = 'project_id';

    path = '/project-summary'
}


export default class Statistics extends Service {
    protected name = 'statistics';

    projectSummary() { return new ProjectSummary(this.name); }
}
