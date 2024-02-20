import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class WebhookVariableModel extends ResourceVariableModel {
    key = 'webhook';

    name = 'Webhook';

    resourceType = 'monitoring.Webhook';

    idKey = 'webhook_id';

    nameFormatter(): string {
        return this.nameKey || this.idKey;
    }
}
