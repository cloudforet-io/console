import type { WebhookPluginInfo } from '@/api-clients/monitoring/webhook/schema/type';

export interface WebhookUpdatePluginParameters {
    webhook_id: string;
    version?: string;
    options?: Record<string, any>;
    upgrade_mode?: WebhookPluginInfo['upgrade_mode'];
}
