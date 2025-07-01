import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CollectorCollectParameters } from '@/api-clients/inventory/collector/schema/api-verbs/collect';
import type { CollectorCreateParameters } from '@/api-clients/inventory/collector/schema/api-verbs/create';
import type { CollectorDeleteParameters } from '@/api-clients/inventory/collector/schema/api-verbs/delete';
import type { CollectorGetParameters } from '@/api-clients/inventory/collector/schema/api-verbs/get';
import type { CollectorListParameters } from '@/api-clients/inventory/collector/schema/api-verbs/list';
import type { CollectorUpdateParameters } from '@/api-clients/inventory/collector/schema/api-verbs/update';
import type { CollectorUpdatePluginParameters } from '@/api-clients/inventory/collector/schema/api-verbs/update-plugin';
import type { CollectorModel } from '@/api-clients/inventory/collector/schema/model';
import type { JobModel } from '@/api-clients/inventory/job/schema/model';


export const useCollectorApi = () => {
    const actions = {
        collect: SpaceConnector.clientV2.inventory.collector.collect<CollectorCollectParameters, JobModel>,
        create: SpaceConnector.clientV2.inventory.collector.create<CollectorCreateParameters, CollectorModel>,
        delete: SpaceConnector.clientV2.inventory.collector.delete<CollectorDeleteParameters>,
        get: SpaceConnector.clientV2.inventory.collector.get<CollectorGetParameters, CollectorModel>,
        list: SpaceConnector.clientV2.inventory.collector.list<CollectorListParameters, ListResponse<CollectorModel>>,
        update: SpaceConnector.clientV2.inventory.collector.update<CollectorUpdateParameters, CollectorModel>,
        updatePlugin: SpaceConnector.clientV2.inventory.collector.updatePlugin<CollectorUpdatePluginParameters, CollectorModel>,
    };

    return {
        collectorAPI: actions,
    };
};
