import type { Tags } from '@/schema/_common/model';

export interface NamespaceGroupCreateParameters {
    namespace_group_id?: string;
    name: string;
    icon: string;
    description?: string;
    tags?: Tags;
}
