import type { Tags } from '@/api-clients/_common/schema/model';

export interface NamespaceUpdateParameters {
    namespace_id: string;
    name?: string;
    icon?: string;
    tags?: Tags;
}
