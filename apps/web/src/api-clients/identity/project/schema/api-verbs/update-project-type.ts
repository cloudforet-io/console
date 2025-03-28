import type { ProjectType } from '@/api-clients/identity/project/schema/type';

export interface ProjectUpdateProjectTypeParameters {
    project_id: string;
    project_type: ProjectType;
}
