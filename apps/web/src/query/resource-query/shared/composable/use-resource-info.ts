import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';


export const useResourceInfo = (resourceKey: ResourceKeyType) => {
    const referenceConfig = RESOURCE_CONFIG_MAP[resourceKey];

    const resourceApiMap = {
        project: useProjectApi,
        projectGroup: useProjectGroupApi,
        role: useRoleApi,
        serviceAccount: useServiceAccountApi,
    };

    return {
        config: referenceConfig,
        api: resourceApiMap[resourceKey]()[`${resourceKey}API`],
    };
};
