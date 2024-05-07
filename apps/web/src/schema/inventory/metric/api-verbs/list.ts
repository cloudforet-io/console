import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { MetricType } from '@/schema/inventory/metric/type';
import type { NamespaceCategory } from '@/schema/inventory/namespace/type';


export interface MetricListParameters {
    query?: Query;
    metric_id?: string;
    metric_type?: MetricType;
    resource_type?: string;
    category?: NamespaceCategory;
    is_managed?: boolean;
    namespace_id?: string;
    workspace_id?: string;
}
