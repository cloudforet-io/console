import { useAppResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-app-resource-menu-handler';
import { useCostDataSourceResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-cost-data-source-resource-menu-handler';
import { useMetricResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-metric-resource-menu-handler';
import { useNamespaceResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-namespace-resource-menu-handler';
import { useProviderResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-provider-resource-menu-handler';
import { useWorkspaceResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-workspace-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';




export const resourceMenuHandlerMap: Record<ResourceKeyType, () => UseResourceMenuHandlerReturnType> = {
    app: useAppResourceMenuHandler,
    workspace: useWorkspaceResourceMenuHandler,
    provider: useProviderResourceMenuHandler,
    costDataSource: useCostDataSourceResourceMenuHandler,
    metric: useMetricResourceMenuHandler,
    namespace: useNamespaceResourceMenuHandler,
    // TODO: add more resource menu handlers. project, projectGroup, workspaceGroup, cloudServiceType, cloudServiceQuerySet, collector, costDataSource, role, region, secret, plugin, etc.
};
