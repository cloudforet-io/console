import { useAppResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-app-resource-menu-handler';
import { useCostDataSourceResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-cost-data-source-resource-menu-handler';
import { useCostResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-cost-resource-menu-handler';
import { useMetricDataResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-metric-data-resource-menu-handler';
import { useMetricResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-metric-resource-menu-handler';
import { useNamespaceResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-namespace-resource-menu-handler';
import { useProjectGroupResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-project-group-resource-menu-handler';
import { useProjectResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-project-resource-menu-handler';
import { useProviderResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-provider-resource-menu-handler';
import { useRegionResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-region-resource-menu-handler';
import { useServiceAccountResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-service-account-resource-menu-handler';
import { useUnifiedCostResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-unified-cost-resource-menu-handler';
import { useWorkspaceResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-workspace-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';

import { useRoleResourceMenuHandler } from './implementations/use-role-resource-menu-handler';


export const resourceMenuHandlerMap: Record<ResourceKeyType, () => UseResourceMenuHandlerReturnType> = {
    app: useAppResourceMenuHandler,
    workspace: useWorkspaceResourceMenuHandler,
    provider: useProviderResourceMenuHandler,
    costDataSource: useCostDataSourceResourceMenuHandler,
    metric: useMetricResourceMenuHandler,
    metricData: useMetricDataResourceMenuHandler,
    namespace: useNamespaceResourceMenuHandler,
    // TODO: add more resource menu handlers. project, projectGroup, workspaceGroup, cloudServiceType, cloudServiceQuerySet, collector, costDataSource, role, region, secret, plugin, etc.
    project: useProjectResourceMenuHandler,
    projectGroup: useProjectGroupResourceMenuHandler,
    workspaceGroup: () => ({} as UseResourceMenuHandlerReturnType),
    cloudServiceType: () => ({} as UseResourceMenuHandlerReturnType),
    // cloudServiceQuerySet: () => ({} as UseResourceMenuHandlerReturnType),
    collector: () => ({} as UseResourceMenuHandlerReturnType),
    role: useRoleResourceMenuHandler,
    region: useRegionResourceMenuHandler,
    secret: () => ({} as UseResourceMenuHandlerReturnType),
    plugin: () => ({} as UseResourceMenuHandlerReturnType),
    serviceAccount: useServiceAccountResourceMenuHandler,
    trustedAccount: () => ({} as UseResourceMenuHandlerReturnType),
    alertManagerWebhook: () => ({} as UseResourceMenuHandlerReturnType),
    monitoringWebhook: () => ({} as UseResourceMenuHandlerReturnType),
    alertManagerEscalationPolicy: () => ({} as UseResourceMenuHandlerReturnType),
    monitoringEscalationPolicy: () => ({} as UseResourceMenuHandlerReturnType),
    service: () => ({} as UseResourceMenuHandlerReturnType),
    user: () => ({} as UseResourceMenuHandlerReturnType),
    userGroup: () => ({} as UseResourceMenuHandlerReturnType),
    workspaceUser: () => ({} as UseResourceMenuHandlerReturnType),
    protocol: () => ({} as UseResourceMenuHandlerReturnType),
    cost: useCostResourceMenuHandler,
    unifiedCost: useUnifiedCostResourceMenuHandler,
};
