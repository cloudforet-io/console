import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EventRuleChangeOrderParameters } from '@/api-clients/alert-manager/event-rule/schema/api-verbs/change-order';
import type { EventRuleCreateParameters } from '@/api-clients/alert-manager/event-rule/schema/api-verbs/create';
import type { EventRuleDeleteParameters } from '@/api-clients/alert-manager/event-rule/schema/api-verbs/delete';
import type { EventRuleGetParameters } from '@/api-clients/alert-manager/event-rule/schema/api-verbs/get';
import type { EventRuleListParameters } from '@/api-clients/alert-manager/event-rule/schema/api-verbs/list';
import type { EventRuleUpdateParameters } from '@/api-clients/alert-manager/event-rule/schema/api-verbs/update';
import type { EventRuleModel } from '@/api-clients/alert-manager/event-rule/schema/model';

export const useEventRuleApi = () => {
    const actions = {
        changeOrder: SpaceConnector.clientV2.alertManager.eventRule.changeOrder<EventRuleChangeOrderParameters, EventRuleModel>,
        create: SpaceConnector.clientV2.alertManager.eventRule.create<EventRuleCreateParameters, EventRuleModel>,
        delete: SpaceConnector.clientV2.alertManager.eventRule.delete<EventRuleDeleteParameters>,
        get: SpaceConnector.clientV2.alertManager.eventRule.get<EventRuleGetParameters, EventRuleModel>,
        list: SpaceConnector.clientV2.alertManager.eventRule.list<EventRuleListParameters, ListResponse<EventRuleModel>>,
        update: SpaceConnector.clientV2.alertManager.eventRule.update<EventRuleUpdateParameters, EventRuleModel>,
    };

    return {
        eventRuleAPI: actions,
    };
};

