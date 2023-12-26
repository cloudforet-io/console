import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { MonitoringType } from '@/schema/monitoring/data-source/type';

export interface DataSourceListParameters {
    query?: Query;
    data_source_id?: string;
    name?: string;
    state?: 'ENABLED' | 'DISABLED';
    monitoring_type?: MonitoringType;
    provider?: string;
}
