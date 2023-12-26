import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { FILE_STATE } from '@/schema/file-manager/type';

export interface FileListParameters {
    file_id?: string;
    name?: string;
    state?: FILE_STATE;
    file_type?: string;
    resource_type?: string;
    resource_id?: string;
    workspace_id?: string;
    domain_id?: string;
    query?: Query;
}
