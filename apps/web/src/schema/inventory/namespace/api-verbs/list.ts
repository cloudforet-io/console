import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { NamespaceCategory } from '@/schema/inventory/namespace/type';


export interface NamespaceListParameters {
    query?: Query;
    namespace_id?: string;
    category?: NamespaceCategory;
    provider?: string;
    workspace_id?: string;
}
