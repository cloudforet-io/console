import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface NoteListParameters {
    note_id?: string;
    alert_id?: string;
    created_by?: string;
    workspace_id?: string;
    project_id?: string;
    query?: Query;
}
