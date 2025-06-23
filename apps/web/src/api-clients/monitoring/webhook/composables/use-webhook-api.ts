import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WebhookCreateParameters } from '@/api-clients/monitoring/webhook/schema/api-verbs/create';
import type { WebhookDeleteParameters } from '@/api-clients/monitoring/webhook/schema/api-verbs/delete';
import type { WebhookDisableParameters } from '@/api-clients/monitoring/webhook/schema/api-verbs/disable';
import type { WebhookEnableParameters } from '@/api-clients/monitoring/webhook/schema/api-verbs/enable';
import type { WebhookGetParameters } from '@/api-clients/monitoring/webhook/schema/api-verbs/get';
import type { WebhookListParameters } from '@/api-clients/monitoring/webhook/schema/api-verbs/list';
import type { WebhookUpdateParameters } from '@/api-clients/monitoring/webhook/schema/api-verbs/update';
import type { WebhookUpdatePluginParameters } from '@/api-clients/monitoring/webhook/schema/api-verbs/update-plugin';
import type { WebhookVerifyPluginParameters } from '@/api-clients/monitoring/webhook/schema/api-verbs/verify-plugin';
import type { WebhookModel } from '@/api-clients/monitoring/webhook/schema/model';

export const useWebhookApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.monitoring.webhook.create<WebhookCreateParameters, WebhookModel>,
        delete: SpaceConnector.clientV2.monitoring.webhook.delete<WebhookDeleteParameters>,
        disable: SpaceConnector.clientV2.monitoring.webhook.disable<WebhookDisableParameters, WebhookModel>,
        enable: SpaceConnector.clientV2.monitoring.webhook.enable<WebhookEnableParameters, WebhookModel>,
        get: SpaceConnector.clientV2.monitoring.webhook.get<WebhookGetParameters, WebhookModel>,
        list: SpaceConnector.clientV2.monitoring.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>,
        update: SpaceConnector.clientV2.monitoring.webhook.update<WebhookUpdateParameters, WebhookModel>,
        updatePlugin: SpaceConnector.clientV2.monitoring.webhook.updatePlugin<WebhookUpdatePluginParameters, WebhookModel>,
        verifyPlugin: SpaceConnector.clientV2.monitoring.webhook.verifyPlugin<WebhookVerifyPluginParameters, WebhookModel>,
    };
    return {
        webhookAPI: actions,
    };
};
