import type { Tags } from '@/api-clients/_common/schema/model';

import type { WebhookPluginInfoType } from '@/schema/alert-manager/webhook/type';

export interface WebhookCreateParameters {
    name: string;
    plugin_info: WebhookPluginInfoType;
    tags?: Tags;
    service_id: string;
}
