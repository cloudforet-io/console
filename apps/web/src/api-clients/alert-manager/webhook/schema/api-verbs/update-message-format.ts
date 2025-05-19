import type { WebhookMessageFormatType } from '@/api-clients/alert-manager/webhook/schema/type';

export interface WebhookUpdateMessageFormatParameters {
    webhook_id: string;
    message_formats?: WebhookMessageFormatType[];
}

