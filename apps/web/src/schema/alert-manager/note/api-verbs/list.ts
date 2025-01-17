import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface NoteListParameters {
    query?: Query;
    note_id?: string;
    created_by?: string;
    alert_id?: string;
    workspace_id?: string;
    service_id?: string;
}
