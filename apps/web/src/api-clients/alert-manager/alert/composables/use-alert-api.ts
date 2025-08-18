import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertCreateParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/create';
import type { AlertDeleteParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/delete';
import type { AlertGetParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/get';
import type { AlertHistoryParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/history';
import type { AlertListParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/list';
import type { AlertUpdateParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/update';
import type { AlertHistoryModel, AlertModel } from '@/api-clients/alert-manager/alert/schema/model';

export const useAlertApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.alertManager.alert.create<AlertCreateParameters, AlertModel>,
        delete: SpaceConnector.clientV2.alertManager.alert.delete<AlertDeleteParameters>,
        get: SpaceConnector.clientV2.alertManager.alert.get<AlertGetParameters, AlertModel>,
        history: SpaceConnector.clientV2.alertManager.alert.history<AlertHistoryParameters, ListResponse<AlertHistoryModel>>,
        list: SpaceConnector.clientV2.alertManager.alert.list<AlertListParameters, ListResponse<AlertModel>>,
        update: SpaceConnector.clientV2.alertManager.alert.update<AlertUpdateParameters, AlertModel>,
    };

    return {
        alertAPI: actions,
    };
};

