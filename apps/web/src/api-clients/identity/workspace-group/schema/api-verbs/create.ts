import type { Tags } from '@/api-clients/_common/schema/model';

export interface WorkspaceGroupCreateParameters {
    name: string;
    tags?: Tags;
}
