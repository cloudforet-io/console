import type { WebhookPluginInfo } from '@/schema/monitoring/webhook/type';

export interface WebhookUpdatePluginParameters {
    webhook_id: string;
    version?: string;
    options?: Record<string, any>;
    upgrade_mode?: WebhookPluginInfo['upgrade_mode'];
}
