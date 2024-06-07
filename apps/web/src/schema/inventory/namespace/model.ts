import type { Tags } from '@/schema/_common/model';
import type { NamespaceCategory, NamespaceGroup } from '@/schema/inventory/namespace/type';


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
