import type { Tags } from '@/api-clients/_common/schema/model';

export interface NamespaceGroupCreateParameters {
    namespace_group_id?: string;
    name: string;
    icon: string;
    description?: string;
    tags?: Tags;
}
