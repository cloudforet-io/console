import type { ProjectType } from '@/schema/identity/project/type';

export interface ProjectUpdateProjectTypeParameters {
    project_id: string;
    project_type: ProjectType;
    workspace_id?: string;
}
