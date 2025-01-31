import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface PrivateFolderListParameters {
    query?: Query;
    folder_id?: string;
    name?: string;
    workspace_id?: string;
}
