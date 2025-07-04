import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ChangeHistoryListParameters } from '@/api-clients/inventory/change-history/schema/api-verbs/list';
import type { ChangeHistoryModel } from '@/api-clients/inventory/change-history/schema/model';

export const useChangeHistoryApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.inventory.changeHistory.list<ChangeHistoryListParameters, ListResponse<ChangeHistoryModel>>,
    };

    return {
        changeHistoryAPI: actions,
    };
};
