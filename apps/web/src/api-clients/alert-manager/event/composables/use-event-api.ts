import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { EventCreateParameters } from '@/api-clients/alert-manager/event/schema/api-verbs/create';
import type { EventModel } from '@/api-clients/alert-manager/event/schema/model';

export const useEventApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.alertManager.event.create<EventCreateParameters, EventModel>,
    };

    return {
        eventAPI: actions,
    };
};

