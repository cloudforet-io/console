import type { Tags } from '@/schema/_common/model';

export interface NamespaceUpdateParameters {
    namespace_id: string;
    name?: string;
    icon?: string;
    tags?: Tags;
}
