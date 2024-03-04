import type { WebhookModel } from '@/schema/monitoring/webhook/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class WebhookVariableModel extends ResourceVariableModel<WebhookModel> {
    static meta = {
        key: 'webhook',
        name: 'Webhook',
        resourceType: 'monitoring.Webhook',
        idKey: 'webhook_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = WebhookVariableModel.meta;
    }

    nameFormatter(): string {
        return this._meta.nameKey || this._meta.idKey;
    }
}
