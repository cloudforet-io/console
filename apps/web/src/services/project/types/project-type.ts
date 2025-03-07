import type { ProjectType } from '@/schema/identity/project/type';

export interface ProjectCardItemType {
    type: 'project' | 'projectGroup';
    id: string;
    name: string;
    parentId?: string;
    projectType?: ProjectType;
}
