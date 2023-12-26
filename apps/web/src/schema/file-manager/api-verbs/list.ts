import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { FileState } from '@/schema/file-manager/type';

export interface FileListParameters {
    query?: Query;
    file_id?: string;
    name?: string;
    state?: FileState;
    file_type?: string;
    resource_type?: string;
    resource_id?: string;
    domain_id?: string;
    workspace_id?: string;
}
