import type { Tags } from '@/schema/_common/model';

export interface WorkspaceGroupCreateParameters {
    name: string;
    tags?: Tags;
}
