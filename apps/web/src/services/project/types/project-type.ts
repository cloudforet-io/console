import type { ProjectType } from '@/schema/identity/project/type';

export interface ProjectCardItemType {
    id: string;
    name: string;
    parentId?: string;
    projectType?: ProjectType;
}
