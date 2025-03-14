import type { ProjectType } from '@/api-clients/identity/project/schema/type';

export interface ProjectCardItemType {
    type: 'project' | 'projectGroup';
    id: string;
    name: string;
    parentId?: string;
    projectType?: ProjectType;
}
