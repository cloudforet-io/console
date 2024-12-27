import type { PluginModel } from '@/schema/repository/plugin/model';

export interface WebhookType extends PluginModel {
    long_description?: string
}
