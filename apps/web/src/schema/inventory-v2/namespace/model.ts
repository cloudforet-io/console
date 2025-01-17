import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { NamespaceCategory } from '@/schema/inventory-v2/namespace/type';


export interface NamespaceModel {
    namespace_id: string;
    name: string;
    category: NamespaceCategory;
    icon: string;
    tags: Tags;
    is_managed: boolean;
    resource_group: ResourceGroupType;
    namespace_group_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
