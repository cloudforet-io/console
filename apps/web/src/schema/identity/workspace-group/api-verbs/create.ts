import type { Tags } from '@/schema/_common/model';

export interface CreateWorkspaceParameters {
    name: string;
    tags?: Tags;
}
