import type { Tags } from '@/api-clients/_common/schema/model';


export interface PrivateFolderCreateParameters {
    name: string;
    tags?: Tags;
    dashboards?: string[];
    workspace_id?: string;
}
