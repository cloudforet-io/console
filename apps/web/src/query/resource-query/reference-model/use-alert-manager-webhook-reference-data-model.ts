import { useWebhookApi } from '@/api-clients/alert-manager/webhook/composables/use-webhook-api';
import type { WebhookModel } from '@/api-clients/alert-manager/webhook/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type AlertManagerWebhookReferenceItem = ReferenceItem<WebhookModel>;
export type AlertManagerWebhookReferenceMap = ReferenceMap<AlertManagerWebhookReferenceItem>;

export const useAlertManagerWebhookReferenceDataModel = () => {
    const { webhookAPI } = useWebhookApi();
    const fetchConfig: ReferenceDataModelFetchConfig<WebhookModel> = {
        listFetcher: webhookAPI.list,
        query: {
            only: ['webhook_id', 'name', 'plugin_info'],
        },
    };
    const {
        referenceMap,
    } = useReferenceDataModel<WebhookModel, AlertManagerWebhookReferenceItem>(
        RESOURCE_CONFIG_MAP.webhook.resourceKey,
        (webhookInfo: WebhookModel) => ({
            key: webhookInfo.webhook_id,
            label: webhookInfo.name,
            name: webhookInfo.name,
            data: webhookInfo,
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
