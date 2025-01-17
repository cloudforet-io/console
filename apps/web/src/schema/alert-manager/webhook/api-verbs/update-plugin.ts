export interface WebhookUpdatePluginParameters {
    webhook_id: string;
    version?: string;
    options?: Record<string, any>;
    upgrade_mode?: 'AUTO' | 'MANUAL';
}
