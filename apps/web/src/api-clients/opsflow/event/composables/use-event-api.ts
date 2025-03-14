import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EventListParameters } from '@/api-clients/opsflow/event/schema/api-verbs/list';
import type { EventModel } from '@/api-clients/opsflow/event/schema/model';

export const useEventApi = () => {
    const eventListQueryKey = useAPIQueryKey('opsflow', 'event', 'list');

    const actions = {
        list: SpaceConnector.clientV2.opsflow.event.list<EventListParameters, ListResponse<EventModel>>,
    };

    return {
        eventListQueryKey,
        eventAPI: actions,
    };
};
