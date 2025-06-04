import type { Ref } from 'vue';
import { computed } from 'vue';

import { useNotificationProtocolApi } from '@/api-clients/alert-manager/notification-protocol/composables/use-notification-protocol-api';
import type { NotificationProtocolModel } from '@/api-clients/alert-manager/notification-protocol/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

type NotificationProtocolItem = NotificationProtocolModel & {
    icon: string;
};
interface UseNotificationProtocolListQueryReturn {
    notificationProtocolListData: Ref<NotificationProtocolItem[]>;
    notificationProtocolListFetching: Ref<boolean>;
}

export const useNotificationProtocolListQuery = (): UseNotificationProtocolListQueryReturn => {
    const { notificationProtocolAPI } = useNotificationProtocolApi();
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;

    const pluginsReferenceMap = computed<PluginReferenceMap>(() => allReferenceGetters.plugin);

    const { key: notificationProtocolListQueryKey } = useServiceQueryKey('alert-manager', 'notification-protocol', 'list');

    const { data: notificationProtocolListData, isFetching: notificationProtocolListFetching } = useScopedQuery({
        queryKey: notificationProtocolListQueryKey,
        queryFn: async () => notificationProtocolAPI.list(),
        select: (data) => data.results?.map((i) => ({
            ...i,
            icon: pluginsReferenceMap.value[i.plugin_info.plugin_id]?.icon || '',
        })),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
    }, ['WORKSPACE']);

    return {
        notificationProtocolListData: computed(() => notificationProtocolListData.value ?? []),
        notificationProtocolListFetching,
    };
};
