import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { AppStatusType } from '@/schema/identity/app/type';

export interface AgentListParameters {
    query?: Query;
    service_account_id?: string;
    state: AppStatusType;
}
