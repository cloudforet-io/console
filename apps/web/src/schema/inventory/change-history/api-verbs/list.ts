import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ChangeHistoryAction, UpdatedBy } from '@/schema/inventory/change-history/type';

export interface ChangeHistoryListParameters {
    cloud_service_id: string;
    query?: Query;
    record_id?: string;
    action?: ChangeHistoryAction;
    user_id?: string;
    collector_id?: string;
    job_id?: string;
    updated_by?: UpdatedBy;
}
