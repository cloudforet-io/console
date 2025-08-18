import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WebhookCreateParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/create';
import type { WebhookDeleteParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/delete';
import type { WebhookDisableParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/disable';
import type { WebhookEnableParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/enable';
import type { WebhookGetParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/get';
import type { WebhookListParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/list';
import type { WebhookListErrorsParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/list-errors';
import type { WebhookUpdateParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/update';
import type { WebhookUpdateMessageFormatParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/update-message-format';
import type { WebhookUpdatePluginParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/update-plugin';
import type { WebhookVerifyPluginParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/verify-plugin';
import type { WebhookListErrorsModel, WebhookModel } from '@/api-clients/alert-manager/webhook/schema/model';

export const useWebhookApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.alertManager.webhook.create<WebhookCreateParameters, WebhookModel>,
        delete: SpaceConnector.clientV2.alertManager.webhook.delete<WebhookDeleteParameters>,
        disable: SpaceConnector.clientV2.alertManager.webhook.disable<WebhookDisableParameters>,
        enable: SpaceConnector.clientV2.alertManager.webhook.enable<WebhookEnableParameters>,
        get: SpaceConnector.clientV2.alertManager.webhook.get<WebhookGetParameters, WebhookModel>,
        listErrors: SpaceConnector.clientV2.alertManager.webhook.listErrors<WebhookListErrorsParameters, ListResponse<WebhookListErrorsModel>>,
        list: SpaceConnector.clientV2.alertManager.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>,
        updateMessageFormat: SpaceConnector.clientV2.alertManager.webhook.updateMessageFormat<WebhookUpdateMessageFormatParameters, WebhookModel>,
        updatePlugin: SpaceConnector.clientV2.alertManager.webhook.updatePlugin<WebhookUpdatePluginParameters, WebhookModel>,
        update: SpaceConnector.clientV2.alertManager.webhook.update<WebhookUpdateParameters, WebhookModel>,
        verifyPlugin: SpaceConnector.clientV2.alertManager.webhook.verifyPlugin<WebhookVerifyPluginParameters, WebhookModel>,
    };

    return {
        webhookAPI: actions,
    };
};

