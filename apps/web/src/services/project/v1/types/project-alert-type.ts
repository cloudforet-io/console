import type { PluginModel } from '@/api-clients/repository/plugin/schema/model';

export interface WebhookType extends PluginModel {
    long_description?: string
}
