import type { Tags } from '@/api-clients/_common/schema/model';
import type {
    WebhookPluginInfoType, WebhookRequestType, WebhookStateType, WebhookMessageFormatType,
} from '@/api-clients/alert-manager/webhook/schema/type';

export interface WebhookModel {
    webhook_id: string;
    name: string;
    state: WebhookStateType;
    access_key: string;
    webhook_url: string;
    plugin_info: WebhookPluginInfoType;
    message_formats: WebhookMessageFormatType[];
    tags: Tags;
    requests: WebhookRequestType;
    service_id: string;
    workspace_id: string;
    domain_id: string;
}


export interface WebhookListErrorsModel {
    error_id: string;
    message: string;
    raw_data: Record<string, any>;
    domain_id: string;
    workspace_id: string;
    service_id: string;
    webhook_id: string;
    created_at: string;
}
