import type { FileModel } from '@/api-clients/file-manager/schema/model';
import type { MentionTargets } from '@/api-clients/opsflow/comment/schema/type';

export interface TaskUpdateDescriptionParameters {
    task_id: string;
    description?: string;
    files?: FileModel[];
    mentions?: MentionTargets;
}
