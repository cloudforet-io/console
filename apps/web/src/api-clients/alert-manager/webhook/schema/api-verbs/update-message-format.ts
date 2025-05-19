import type { WebhookMessageFormatType } from '@/schema/alert-manager/webhook/type';

export interface WebhookUpdateMessageFormatParameters {
    webhook_id: string;
    message_formats?: WebhookMessageFormatType[];
}

