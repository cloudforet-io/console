import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { cloneDeep, find } from 'lodash';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';

import type { DisplayMenu } from '@/store/menu/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { getParsedKeysWithManagedCostQueryFavoriteKey } from '@/lib/helper/config-data-helper';
import { getAllSuggestionMenuList } from '@/lib/helper/menu-suggestion-helper';
import { useAllMenuList } from '@/lib/menu/use-all-menu-list';

import type { RecentConfig, RecentType } from '@/common/modules/navigations/type';
import {
    FAVORITE_TYPE, type FavoriteConfig, type FavoriteType, type FavoriteItem,
} from '@/common/modules/user-config/favorite/favorite-button/type';
import { useCloudServiceTypeMap } from '@/common/modules/user-config/shared/_internal/use-cloud-service-type-map';
import { useCostQuerySetMap } from '@/common/modules/user-config/shared/_internal/use-cost-query-set-map';
import { useDashboardMap } from '@/common/modules/user-config/shared/_internal/use-dashboard-map';
import { useMetricExampleMap } from '@/common/modules/user-config/shared/_internal/use-metric-example-map';
import { useWorkspaceMap } from '@/common/modules/user-config/shared/_internal/use-workspace-map';


export interface ConfigData extends Omit<RecentConfig, 'itemType'>, Omit<FavoriteConfig, 'itemType'> {
    itemType: RecentType|FavoriteType;
}

export interface ReferenceData extends Omit<FavoriteItem, 'itemType'> {
    itemType: RecentType|FavoriteType;
}

interface UseConvertReferencedConfigDataOptions {
    allConfigList?: ComputedRef<ConfigData[]>;
    projectConfigList?: ComputedRef<ConfigData[]>;
    projectGroupConfigList?: ComputedRef<ConfigData[]>;
    metricConfigList?: ComputedRef<ConfigData[]>;
    metricExampleConfigList?: ComputedRef<ConfigData[]>;
    serviceConfigList?: ComputedRef<ConfigData[]>;
    dashboardConfigList?: ComputedRef<ConfigData[]>;
    costQuerySetConfigList?: ComputedRef<ConfigData[]>;
    cloudServiceConfigList?: ComputedRef<ConfigData[]>;
    workspaceConfigList?: ComputedRef<ConfigData[]>;
}

export const useConvertReferencedConfigData = ({
    allConfigList,
    projectConfigList,
    projectGroupConfigList,
    metricConfigList,
    metricExampleConfigList,
    serviceConfigList,
    dashboardConfigList,
    costQuerySetConfigList,
    cloudServiceConfigList,
    workspaceConfigList,
}: UseConvertReferencedConfigDataOptions) => {
    /* Reference */
    const referenceMap = useAllReferenceDataModel();
    const projectMap = referenceMap.project;
    const projectGroupMap = referenceMap.projectGroup;
    const metricMap = referenceMap.metric;
    const serviceMap = referenceMap.service;
    const costDataSourceMap = referenceMap.costDataSource;
    const { map: cloudServiceTypeMap, loading: isLoadingCloudServiceTypeMap } = useCloudServiceTypeMap();
    const { map: dashboardMap, loading: isLoadingDashboardMap } = useDashboardMap();
    const { map: costQuerySetMap, loading: isLoadingCostQuerySetMap } = useCostQuerySetMap();
    const { map: metricExampleMap, loading: isLoadingMetricExampleMap } = useMetricExampleMap();
    const { map: workspaceMap, loading: isLoadingWorkspaceMap } = useWorkspaceMap();

    /* Menu */
    const { getAllMenuList } = useAllMenuList();
    const router = useRouter();
    const route = useRoute();
    const allMenuList = computed<DisplayMenu[]>(() => getAllMenuList(route, router));

    /* Converted */
    const convertedMenuList = computed<ReferenceData[]>(() => {
        const convertMenuList = cloneDeep(allMenuList.value);

        const suggestionMenuList = getAllSuggestionMenuList(convertMenuList);
        const results: ReferenceData[] = [];
        if (!allConfigList?.value) return results;

        const reorderedConfig: ConfigData[] = [];
        suggestionMenuList.forEach((menu) => {
            const configItem = allConfigList?.value.find((item) => item.itemId === menu.id);
            if (configItem) {
                reorderedConfig.push(configItem);
            }
        });

        return reorderedConfig.map((d) => {
            const menu = find(suggestionMenuList, { id: d.itemId });
            return {
                ...d,
                itemType: FAVORITE_TYPE.MENU,
                itemId: menu?.id || d.itemId,
                name: menu?.id || d.itemId,
                label: menu?.label || d.itemId,
                icon: menu?.parents?.[0]?.icon || menu?.icon || undefined,
                parents: menu?.parents || [],
                updatedAt: d?.updatedAt,
                isDeleted: !menu,
            };
        });
    });

    const convertedProjectList = computed<ReferenceData[]>(() => (projectConfigList?.value ?? []).map((d) => {
        const project = projectMap[d.itemId];
        const parents = project?.data?.groupInfo?.id ? [{
            name: project.data?.groupInfo?.id,
            label: project.data?.groupInfo?.name,
        }] : undefined;
        return {
            ...d,
            name: d.itemId,
            label: project?.name || d.itemId,
            icon: 'ic_document-filled',
            updatedAt: d?.updatedAt,
            parents,
            isDeleted: !project,
        };
    }));

    const convertedProjectGroupList = computed<ReferenceData[]>(() => (projectGroupConfigList?.value ?? []).map((d) => {
        const projectGroup = projectGroupMap[d.itemId];
        const parents = projectGroup?.data?.parentGroupInfo?.id ? [{
            name: projectGroup.data?.parentGroupInfo?.id,
            label: projectGroup.data?.parentGroupInfo?.name,
        }] : undefined;
        return {
            ...d,
            name: d.itemId,
            label: projectGroup?.name || d.itemId,
            icon: 'ic_folder-filled',
            parents,
            isDeleted: !projectGroup,
        };
    }));

    const convertedCloudServiceTypeList = computed<ReferenceData[]>(() => (cloudServiceConfigList?.value ?? []).map((d) => {
        const cloudServiceType = cloudServiceTypeMap.value.get(d.itemId);
        return {
            ...d,
            name: d.itemId,
            label: cloudServiceType?.name || d.itemId,
            icon: assetUrlConverter(cloudServiceType?.tags['spaceone:icon']),
            provider: cloudServiceType?.provider,
            parents: [{
                name: cloudServiceType?.group,
                label: cloudServiceType?.group,
            }],
            updatedAt: d.updatedAt,
            isDeleted: !cloudServiceType,
        };
    }));

    const convertedMetricList = computed<ReferenceData[]>(() => (metricConfigList?.value ?? []).map((d) => {
        const metric = metricMap[d.itemId];
        return {
            ...d,
            name: d.itemId,
            label: metric?.name || d.itemId,
            icon: d.itemId.startsWith('metric-managed-') ? 'ic_main-filled' : 'ic_sub',
            updatedAt: d?.updatedAt,
            isDeleted: !metric,
        };
    }));

    const convertedMetricExampleList = computed<ReferenceData[]>(() => (metricExampleConfigList?.value ?? []).map((d) => {
        const metricExample = metricExampleMap.value.get(d.itemId);
        return {
            ...d,
            name: d.itemId,
            label: metricExample?.name || d.itemId,
            icon: 'ic_example-filled',
            updatedAt: d?.updatedAt,
            isDeleted: !metricExample,
        };
    }));

    const convertedServiceList = computed<ReferenceData[]>(() => (serviceConfigList?.value ?? []).map((d) => {
        const service = serviceMap[d.itemId];
        return {
            ...d,
            itemType: FAVORITE_TYPE.SERVICE,
            itemId: service?.name || d.itemId,
            name: service?.name || d.itemId,
            label: service?.label || d.itemId,
            icon: 'ic_service_alert',
            updatedAt: d?.updatedAt,
            isDeleted: !service,
        };
    }));

    const convertedDashboardList = computed<ReferenceData[]>(() => (dashboardConfigList?.value ?? []).map((d) => {
        const dashboard = dashboardMap.value.get(d.itemId);
        return {
            ...d,
            name: dashboard?.dashboard_id || d.itemId,
            label: dashboard?.name || d.itemId,
            icon: 'ic_service_dashboard',
            updatedAt: d.updatedAt,
            isDeleted: !dashboard,
        };
    }));

    const convertedCostQuerySetList = computed<ReferenceData[]>(() => (costQuerySetConfigList?.value ?? []).map((d) => {
        const parsedKeys = getParsedKeysWithManagedCostQueryFavoriteKey(d.itemId);
        if (parsedKeys) {
            const [dataSourceId, costQuerySetId] = parsedKeys;
            const dataSource = costDataSourceMap[dataSourceId];
            return {
                ...d,
                name: d.itemId,
                label: costQuerySetId || d.itemId,
                updatedAt: d.updatedAt,
                icon: 'ic_service_cost-explorer',
                dataSourceId,
                parents: [{
                    name: dataSourceId,
                    label: dataSource?.label,
                }],
                isDeleted: false,
            };
        }
        const costQuerySet = costQuerySetMap[d.itemId];
        return {
            ...d,
            name: costQuerySet?.cost_query_set_id || d.itemId,
            label: costQuerySet?.name || d.itemId,
            updatedAt: d.updatedAt,
            icon: 'ic_service_cost-explorer',
            dataSourceId: costQuerySet?.data_source_id,
            parents: [{
                name: costQuerySet?.data_source_id,
                label: costDataSourceMap[costQuerySet?.data_source_id]?.label,
            }],
            isDeleted: !costQuerySet,
        };
    }));

    const convertedWorkspaceList = computed<ReferenceData[]>(() => (workspaceConfigList?.value ?? []).map((d) => {
        const workspace = workspaceMap.value.get(d.itemId);
        return {
            ...d,
            itemType: FAVORITE_TYPE.WORKSPACE,
            itemId: workspace?.workspace_id || d.itemId,
            name: workspace?.workspace_id || d.itemId,
            label: workspace?.name || d.itemId,
            tags: workspace?.tags,
            isDeleted: !workspace,
        };
    }));


    return {
        convertedMenu: convertedMenuList,
        convertedProject: convertedProjectList,
        convertedProjectGroup: convertedProjectGroupList,
        convertedMetric: convertedMetricList,
        convertedMetricExample: convertedMetricExampleList,
        convertedService: convertedServiceList,
        convertedCloudServiceType: convertedCloudServiceTypeList,
        convertedDashboard: convertedDashboardList,
        convertedCostQuerySet: convertedCostQuerySetList,
        convertedWorkspace: convertedWorkspaceList,
        loading: computed(() => isLoadingCloudServiceTypeMap.value || isLoadingDashboardMap.value || isLoadingCostQuerySetMap.value || isLoadingMetricExampleMap.value || isLoadingWorkspaceMap.value),
    };
};


