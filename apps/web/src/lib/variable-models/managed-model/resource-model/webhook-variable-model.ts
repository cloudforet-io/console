import type { WebhookModel } from '@/schema/monitoring/webhook/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class WebhookVariableModel extends ResourceVariableModel<WebhookModel> {
    static _meta = {
        key: 'webhook',
        name: 'Webhook',
        resourceType: 'monitoring.Webhook',
        idKey: 'webhook_id',
        nameKey: 'name',
    };

    constructor() {
        super();
        this._meta = WebhookVariableModel._meta;
    }

    nameFormatter(): string {
        return this._meta.nameKey || this._meta.idKey;
    }
}
