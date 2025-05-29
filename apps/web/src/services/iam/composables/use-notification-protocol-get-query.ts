import type { Ref } from 'vue';
import { computed } from 'vue';

import { useNotificationProtocolApi } from '@/api-clients/alert-manager/notification-protocol/composables/use-notification-protocol-api';
import type { NotificationProtocolModel } from '@/api-clients/alert-manager/notification-protocol/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseNotificationProtocolGetQueryReturn {
    notificationProtocolData: Ref<NotificationProtocolModel | undefined>;
}

export const useNotificationProtocolGetQuery = (protocolId: string): UseNotificationProtocolGetQueryReturn => {
    const { notificationProtocolAPI } = useNotificationProtocolApi();

    const { key: notificationProtocolQueryKey, params: notificationProtocolQueryParams } = useServiceQueryKey('alert-manager', 'notification-protocol', 'get', {
        params: computed(() => ({
            protocol_id: protocolId,
        })),
    });

    const { data: notificationProtocolData } = useScopedQuery({
        queryKey: notificationProtocolQueryKey,
        queryFn: () => notificationProtocolAPI.get(notificationProtocolQueryParams.value),
        enabled: computed(() => !!protocolId),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        notificationProtocolData,
    };
};
