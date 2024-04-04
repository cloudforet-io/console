import type { Tags } from '@/schema/_common/model';
import type { FileReference } from '@/schema/file-manager/type';

export interface FileUpdateParameters {
    file_id: string;
    tags?: Tags;
    reference?: FileReference;
}
