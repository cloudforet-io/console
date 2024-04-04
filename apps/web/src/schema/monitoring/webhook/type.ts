export type WebhookState = 'ENABLED' | 'DISABLED';
export interface WebhookPluginInfo {
    plugin_id: string;
    version?: string;
    options?: Record<string, any>;
    metadata?: Record<string, any>;
    upgrade_mode?: 'AUTO' | 'MANUAL';
}
