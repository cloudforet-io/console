import type { Tags } from '@/schema/_common/model';

export interface WorkspaceCreateParameters {
    name: string;
    tags?: Tags;
}
