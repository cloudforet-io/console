import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { AppStatusType } from '@/api-clients/identity/app/schema/type';

export interface AgentListParameters {
    query?: Query;
    service_account_id?: string;
    state: AppStatusType;
}
