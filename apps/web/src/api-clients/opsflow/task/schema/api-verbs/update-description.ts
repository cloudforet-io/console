import type { MentionTargets } from '@/api-clients/opsflow/comment/schema/type';
import type { FileModel } from '@/schema/file-manager/model';

export interface TaskUpdateDescriptionParameters {
    task_id: string;
    description?: string;
    files?: FileModel[];
    mentions?: MentionTargets;
}
