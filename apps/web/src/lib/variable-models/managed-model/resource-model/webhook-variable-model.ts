import type { WebhookModel } from '@/schema/monitoring/webhook/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class WebhookVariableModel extends ResourceVariableModel<WebhookModel> {
    meta = {
        key: 'webhook',
        name: 'Webhook',
        resourceType: 'monitoring.Webhook',
        idKey: 'webhook_id',
        nameKey: 'name',
    };

    nameFormatter(): string {
        return this.meta.nameKey || this.meta.idKey;
    }
}
