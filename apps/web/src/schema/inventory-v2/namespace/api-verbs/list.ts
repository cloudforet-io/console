import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ResourceGroupType } from '@/schema/_common/type';
import type { NamespaceCategory } from '@/schema/inventory-v2/namespace/type';


export interface NamespaceListParameters {
    query?: Query;
    namespace_id?: string;
    category?: NamespaceCategory;
    resource_type?: string;
    resource_group: ResourceGroupType;
    exists_only?: boolean;
    namespace_group_id?: string;
    workspace_id?: string;
}
