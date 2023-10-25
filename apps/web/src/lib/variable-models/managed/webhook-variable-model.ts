import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class WebhookVariableModel extends ResourceNameVariableModel {
    key = 'webhook';

    name = 'Webhook';

    labels: VariableModelLabel[] = [];

    resourceType = 'monitoring.Webhook';

    idKey = 'webhook_id';

    formatter(): string {
        return this.nameKey || this.idKey;
    }
}
