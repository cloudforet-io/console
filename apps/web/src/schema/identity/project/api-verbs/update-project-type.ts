import type { ProjectType } from '@/schema/identity/project/type';

export interface ProjectUpdateProjectTypeRequestParams {
    project_id: string;
    workspace_id: string;
    project_type: ProjectType;
}
