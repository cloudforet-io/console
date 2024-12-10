import type { Tags } from '@/schema/_common/model';

export interface NamespaceGroupUpdateParameters {
    namespace_group_id: string;
    name?: string;
    icon?: string;
    description?: string;
    tags?: Tags;
}
