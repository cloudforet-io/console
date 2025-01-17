import type { WEBHOOK_STATE } from '@/schema/alert-manager/webhook/constants';

export type WebhookStateType = typeof WEBHOOK_STATE[keyof typeof WEBHOOK_STATE];

export type WebhookPluginInfoType = {
    plugin_id: string;
    version?: string;
    options?: Record<string, any>;
    metadata?: Record<string, any>;
    upgrade_mode?: 'AUTO' | 'MANUAL';
};

export type WebhookRequestType = {
    total: number;
    error: number;
};

export type WebhookMessageFormatType = {
    from: string;
    to: string;
};
