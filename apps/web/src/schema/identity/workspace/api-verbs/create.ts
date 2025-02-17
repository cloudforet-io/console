import type { Tags } from '@/api-clients/_common/schema/model';

export interface WorkspaceCreateParameters {
    name: string;
    tags?: Tags;
    package_id?: string;
}
