import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { NamespaceCategory } from '@/schema/inventory-v2/namespace/type';

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
