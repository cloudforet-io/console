import type { Tags } from '@/api-clients/_common/schema/model';
import type { NamespaceCategory, NamespaceGroup } from '@/api-clients/inventory/namespace/schema/type';


export interface NamespaceModel {
    namespace_id: string;
    name: string;
    category: NamespaceCategory;
    // provider: string;
    resource_type: string;
    group: NamespaceGroup;
    tags: Tags;
    domain_id: string;
    created_at: string;
    icon: string;
}
