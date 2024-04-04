import type { Tags } from '@/schema/_common/model';
import type { WebhookPluginInfo } from '@/schema/monitoring/webhook/type';

export interface WebhookCreateParameters {
    name: string;
    plugin_info: WebhookPluginInfo;
    project_id: string;
    tags?: Tags;
}
