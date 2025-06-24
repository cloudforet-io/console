import type { Tags } from '@/api-clients/_common/schema/model';
import type { WebhookPluginInfo } from '@/api-clients/monitoring/webhook/schema/type';

export interface WebhookCreateParameters {
    name: string;
    plugin_info: WebhookPluginInfo;
    project_id: string;
    tags?: Tags;
}
