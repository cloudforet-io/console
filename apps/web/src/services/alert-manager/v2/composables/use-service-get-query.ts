import type { Ref } from 'vue';
import { computed } from 'vue';

import { useServiceApi } from '@/api-clients/alert-manager/service/composables/use-service-api';
import { NOTIFICATION_URGENCY, RECOVERY_MODE, SERVICE_ALERTS_TYPE } from '@/api-clients/alert-manager/service/schema/constants';
import type { AlertsInfoType, AlertsType } from '@/api-clients/alert-manager/service/schema/type';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import type { Service } from '@/services/alert-manager/v2/types/alert-manager-type';

interface UseServiceGetQueryReturn {
    serviceData: Ref<Partial<Service> | undefined>;
}

export const useServiceGetQuery = (serviceId: string): UseServiceGetQueryReturn => {
    const { serviceAPI } = useServiceApi();

    const { key: serviceQueryKey, params: serviceQueryParams } = useServiceQueryKey('alert-manager', 'service', 'get', {
        params: computed(() => ({
            service_id: serviceId,
        })),
    });

    const { data: serviceData } = useScopedQuery({
        queryKey: serviceQueryKey,
        queryFn: () => serviceAPI.get(serviceQueryParams.value),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
    }, ['WORKSPACE']);

    const refinedServiceData = computed(() => {
        const getAlerts = (alertKey: AlertsType): AlertsInfoType => {
            const alertValue = serviceData.value?.alerts?.[alertKey] || { HIGH: 0, LOW: 0 };
            return {
                HIGH: alertValue.HIGH || 0,
                LOW: alertValue.LOW || 0,
            };
        };
        return {
            ...serviceData.value,
            members: {
                USER_GROUP: serviceData.value?.members?.USER_GROUP || [],
                USER: serviceData.value?.members?.USER || [],
            },
            options: {
                notification_urgency: serviceData.value?.options?.notification_urgency || NOTIFICATION_URGENCY.ALL,
                recovery_mode: serviceData.value?.options?.recovery_mode || RECOVERY_MODE.MANUAL,
            },
            alerts: {
                TRIGGERED: getAlerts(SERVICE_ALERTS_TYPE.TRIGGERED),
                ACKNOWLEDGED: getAlerts(SERVICE_ALERTS_TYPE.ACKNOWLEDGED),
                RESOLVED: getAlerts(SERVICE_ALERTS_TYPE.RESOLVED),
                TOTAL: getAlerts(SERVICE_ALERTS_TYPE.TOTAL),
            },
        };
    });

    return {
        serviceData: computed(() => refinedServiceData.value),
    };
};
