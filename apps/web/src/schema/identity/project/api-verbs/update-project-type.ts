import type { ProjectType } from '@/schema/identity/project/type';

export interface ProjectUpdateProjectTypeRequestParameters {
    project_id: string;
    project_type: ProjectType;
    workspace_id?: string;
}
