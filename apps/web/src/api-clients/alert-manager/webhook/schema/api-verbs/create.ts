import type { Tags } from '@/api-clients/_common/schema/model';
import type { WebhookPluginInfoType } from '@/api-clients/alert-manager/webhook/schema/type';

export interface WebhookCreateParameters {
    name: string;
    plugin_info: WebhookPluginInfoType;
    tags?: Tags;
    service_id: string;
}
