import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { NamespaceCategory } from '@/api-clients/inventory-v2/namespace/schema/type';

export interface NamespaceCreateParameters {
    namespace_id?: string;
    name: string;
    category: NamespaceCategory;
    icon?: string;
    tags?: Tags;
    resource_group: ResourceGroupType;
    namespace_group_id: string;
    workspace_id?: string;
}
