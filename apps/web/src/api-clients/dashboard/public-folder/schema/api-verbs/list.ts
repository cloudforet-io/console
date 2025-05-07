import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface PublicFolderListParameters {
    query?: Query;
    folder_id?: string;
    name?: string;
    workspace_id?: string;
    project_id?: string;
    project_group_id?: string;
}
