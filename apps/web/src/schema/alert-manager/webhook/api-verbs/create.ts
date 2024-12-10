import type { Tags } from '@/schema/_common/model';
import type { WebhookPluginInfoType } from '@/schema/alert-manager/webhook/type';

export interface WebhookCreateParameters {
    name: string;
    plugin_info: WebhookPluginInfoType;
    tags?: Tags;
    service_id: string;
}
