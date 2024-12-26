import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface SharedConfigListParameters {
    query?: Query;
    name?: string;
    project_id?: string;
    workspace_id?: string;
}
