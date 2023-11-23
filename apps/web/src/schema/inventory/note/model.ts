import type { TimeStamp } from '@/schema/_common/model';

export interface NoteModel {
    note_id: string;
    cloud_service_id: string;
    note: string;
    user_id: string;
    project_id: string;
    created_at: TimeStamp|string;
}
