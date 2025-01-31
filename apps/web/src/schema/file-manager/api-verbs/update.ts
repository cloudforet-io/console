import type { Tags } from '@/api-clients/_common/schema/model';
import type { FileReference } from '@/schema/file-manager/type';

export interface FileUpdateParameters {
    file_id: string;
    tags?: Tags;
    reference?: FileReference;
}
