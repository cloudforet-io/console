import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { MonitoringLogListParameters } from '@/api-clients/monitoring/log/schema/api-verbs/list';
import type { LogModel } from '@/api-clients/monitoring/log/schema/model';



export const useLogApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.monitoring.log.list<MonitoringLogListParameters, ListResponse<LogModel>>,
    };
    return {
        logAPI: actions,
    };
};
