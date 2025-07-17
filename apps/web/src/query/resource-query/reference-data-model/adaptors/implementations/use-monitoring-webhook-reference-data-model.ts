import { useWebhookApi } from '@/api-clients/monitoring/webhook/composables/use-webhook-api';
import type { WebhookModel } from '@/api-clients/monitoring/webhook/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type MonitoringWebhookReferenceItem = ReferenceItem<WebhookModel>;
export type MonitoringWebhookReferenceMap = ReferenceMap<MonitoringWebhookReferenceItem>;

export const useMonitoringWebhookReferenceDataModel = () => {
    const { webhookAPI } = useWebhookApi();
    const fetchConfig: ReferenceDataModelFetchConfig<WebhookModel> = {
        listFetcher: webhookAPI.list,
        query: {
            only: ['webhook_id', 'name', 'plugin_info'],
        },
    };
    const {
        referenceMap,
    } = useReferenceDataModel<WebhookModel, MonitoringWebhookReferenceItem>(
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
