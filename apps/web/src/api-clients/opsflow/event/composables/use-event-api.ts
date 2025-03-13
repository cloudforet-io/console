import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EventListParameters } from '@/api-clients/opsflow/event/schema/api-verbs/list';
import type { EventModel } from '@/api-clients/opsflow/event/schema/model';

interface UseEventApiReturn {
    eventListQueryKey: ComputedRef<QueryKey>;
    eventAPI: {
        list: (params: EventListParameters) => Promise<ListResponse<EventModel>>;
    }
}

export const useEventApi = (): UseEventApiReturn => {
    const eventListQueryKey = useAPIQueryKey('opsflow', 'event', 'list');

    const actions = {
        async list(params: EventListParameters) {
            return SpaceConnector.clientV2.opsflow.event.list<EventListParameters, ListResponse<EventModel>>(params);
        },
    };

    return {
        eventListQueryKey,
        eventAPI: actions,
    };
};
