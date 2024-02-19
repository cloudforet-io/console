import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class WebhookVariableModel extends ResourceNameVariableModel {
    key = 'webhook';

    name = 'Webhook';

    resourceType = 'monitoring.Webhook';

    idKey = 'webhook_id';

    nameFormatter(): string {
        return this.nameKey || this.idKey;
    }
}
