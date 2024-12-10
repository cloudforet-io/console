import type { Tags } from '@/schema/_common/model';
import type { WebhookPluginInfoType, WebhookRequestType, WebhookStateType } from '@/schema/alert-manager/webhook/type';

export interface WebhookModel {
    webhook_id: string;
    name: string;
    state: WebhookStateType;
    access_key: string;
    webhook_url: string;
    plugin_info: WebhookPluginInfoType;
    tags: Tags;
    requests: WebhookRequestType;
    service_id: string;
    workspace_id: string;
    domain_id: string;
}
