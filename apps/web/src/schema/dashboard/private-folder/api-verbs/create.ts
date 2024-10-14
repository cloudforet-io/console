import type { Tags } from '@/schema/_common/model';


export interface PrivateFolderCreateParameters {
    name: string;
    tags?: Tags;
    dashboards?: string[];
    workspace_id?: string;
}
