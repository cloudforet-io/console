import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { NamespaceCategory } from '@/api-clients/inventory-v2/namespace/schema/type';


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
