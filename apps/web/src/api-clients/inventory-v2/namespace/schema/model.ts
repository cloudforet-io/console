import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { NamespaceCategory } from '@/api-clients/inventory-v2/namespace/schema/type';


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
