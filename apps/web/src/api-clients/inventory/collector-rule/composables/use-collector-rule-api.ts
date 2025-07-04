import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CollectorRuleChangeOrderParameters } from '@/api-clients/inventory/collector-rule/schema/api-verbs/change-order';
import type { CollectorRuleCreateParameters } from '@/api-clients/inventory/collector-rule/schema/api-verbs/create';
import type { CollectorRuleDeleteParameters } from '@/api-clients/inventory/collector-rule/schema/api-verbs/delete';
import type { CollectorRuleListParameters } from '@/api-clients/inventory/collector-rule/schema/api-verbs/list';
import type { CollectorRuleUpdateParameters } from '@/api-clients/inventory/collector-rule/schema/api-verbs/update';
import type { CollectorRuleModel } from '@/api-clients/inventory/collector-rule/schema/model';


export const useCollectorRuleApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.inventory.collectorRule.list<CollectorRuleListParameters, ListResponse<CollectorRuleModel>>,
        changeOrder: SpaceConnector.clientV2.inventory.collectorRule.changeOrder<CollectorRuleChangeOrderParameters>,
        create: SpaceConnector.clientV2.inventory.collectorRule.create<CollectorRuleCreateParameters>,
        delete: SpaceConnector.clientV2.inventory.collectorRule.delete<CollectorRuleDeleteParameters>,
        update: SpaceConnector.clientV2.inventory.collectorRule.update<CollectorRuleUpdateParameters>,
    };

    return {
        collectorRuleAPI: actions,
    };
};
