import type { Tags } from '@/api-clients/_common/schema/model';
import type { FileReference } from '@/api-clients/file-manager/schema/type';

export interface FileUpdateParameters {
    file_id: string;
    tags?: Tags;
    reference?: FileReference;
}
