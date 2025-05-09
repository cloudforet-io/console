import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EventListParameters } from '@/api-clients/opsflow/event/schema/api-verbs/list';
import type { EventModel } from '@/api-clients/opsflow/event/schema/model';

export const useEventApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.opsflow.event.list<EventListParameters, ListResponse<EventModel>>,
    };

    return {
        eventAPI: actions,
    };
};
