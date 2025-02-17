import type { FileModel } from '../../../../../schema/file-manager/model';
import type { MentionTargets } from '../../../comment/schema/type';

export interface TaskUpdateDescriptionParameters {
    task_id: string;
    description?: string;
    files?: FileModel[];
    mentions?: MentionTargets;
}
