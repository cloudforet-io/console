import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface NoteListParameters {
    query?: Query;
    note_id?: string;
    created_by?: string;
    record_id?: string;
    cloud_service_id?: string;
    project_id?: string;
    workspace_id?: string;
}
