import { find } from 'lodash';

import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import type { DisplayMenu } from '@/store/modules/display/type';
import type { CloudServiceTypeReferenceMap } from '@/store/reference/cloud-service-type-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceItem, ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { getAllSuggestionMenuList } from '@/lib/helper/menu-suggestion-helper';

import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteConfig, FavoriteItem } from '@/common/modules/favorites/favorite-button/type';

import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';

type Config = FavoriteConfig;

export interface ConfigData extends Config {
    [key: string]: any;
}

type ReferenceItem = FavoriteItem;

export interface ReferenceData extends ReferenceItem {
    [key: string]: any;
}

export const convertMenuConfigToReferenceData = (config: ConfigData[]|null, menuList: DisplayMenu[]): ReferenceData[] => {
    const allMenuList = getAllSuggestionMenuList(menuList);
    const results: ReferenceData[] = [];
    if (!config) return results;

    const reorderedConfig: ConfigData[] = [];
    allMenuList.forEach((menu) => {
        const configItem = config.find((item) => item.itemId === menu.id);
        if (configItem) {
            reorderedConfig.push(configItem);
        }
    });

    reorderedConfig.forEach((d) => {
        const menu = find(allMenuList, { id: d.itemId });
        if (menu) {
            results.push({
                ...d,
                itemType: FAVORITE_TYPE.MENU,
                itemId: menu.id,
                name: menu.id,
                label: menu.label,
                icon: menu.parents?.[0]?.icon ?? menu.icon,
                parents: menu.parents,
                updatedAt: d?.updatedAt,
            });
        } else {
            results.push({
                ...d,
                isDeleted: !menu,
            });
        }
    });
    return results;
};

export const convertProjectConfigToReferenceData = (config: ConfigData[]|null, projectReference: ProjectReferenceMap): ReferenceData[] => {
    const results: ReferenceData[] = [];
    if (!config) return results;

    config.forEach((d) => {
        const resource: ProjectReferenceItem = projectReference[d.itemId];
        if (resource) {
            const result: ReferenceData = {
                ...d,
                name: d.itemId,
                label: resource.name || d.itemId,
                icon: 'ic_document-filled',
                updatedAt: d?.updatedAt,
            };
            if (resource?.data?.groupInfo?.id) {
                result.parents = [{
                    name: resource.data?.groupInfo?.id,
                    label: resource.data?.groupInfo?.name,
                }];
            }
            results.push(result);
        } else {
            results.push({
                ...d,
                isDeleted: !resource,
            });
        }
    });
    return results;
};

export const convertProjectGroupConfigToReferenceData = (config: ConfigData[]|null, projectGroupReference: ProjectGroupReferenceMap): ReferenceData[] => {
    const results: ReferenceData[] = [];
    if (!config) return results;

    config.forEach((d) => {
        const resource: ProjectGroupReferenceItem = projectGroupReference[d.itemId];
        if (resource) {
            const result: ReferenceData = {
                ...d,
                name: d.itemId,
                label: resource?.name || d.itemId,
                icon: 'ic_folder-filled',
            };
            if (resource?.data?.parentGroupInfo?.id) {
                result.parents = [{
                    name: resource.data?.parentGroupInfo?.id,
                    label: resource.data?.parentGroupInfo?.name,
                }];
            }
            results.push(result);
        } else {
            results.push({
                ...d,
                isDeleted: !resource,
            });
        }
    });
    return results;
};

export const convertCloudServiceConfigToReferenceData = (config: ConfigData[]|null, cloudServiceReference: CloudServiceTypeReferenceMap) => {
    const results: ReferenceData[] = [];
    if (!config) return results;

    const reorderedConfig: ConfigData[] = [];
    Object.values(cloudServiceReference).forEach((menu) => {
        const configItem = config.find((item) => item.itemId === menu.data.cloud_service_type_key);
        if (configItem) {
            reorderedConfig.push(configItem);
        }
    });

    reorderedConfig.forEach((d) => {
        const resource = Object.values(cloudServiceReference)
            .find((c) => c.data.cloud_service_type_key === d.itemId);
        if (resource) {
            results.push({
                ...d,
                name: d.itemId,
                label: resource.name || d.itemId,
                icon: resource.icon,
                provider: resource.data?.provider,
                parents: [{
                    name: resource.data?.group,
                    label: resource.data?.group,
                }],
                updatedAt: d.updatedAt,
            });
        } else {
            results.push({
                ...d,
                isDeleted: !resource,
            });
        }
    });
    return results;
};

export const convertCostAnalysisConfigToReferenceData = (config: ConfigData[]|null, costQuerySetList: CostQuerySetModel[], dataSourceMap: CostDataSourceReferenceMap): ReferenceData[] => {
    const results: ReferenceData[] = [];
    if (!config) return results;

    const groupedResults: Record<string, ReferenceData[]> = {};

    config.forEach((d) => {
        const parsedKeys = getParsedKeysWithManagedCostQueryFavoriteKey(d.itemId);
        if (parsedKeys) { // managed cost query set
            const [dataSourceId, costQuerySetId] = parsedKeys;
            if (!dataSourceMap[dataSourceId]) return;
            const item: ReferenceData = {
                ...d,
                name: d.itemId,
                label: costQuerySetId,
                updatedAt: d.updatedAt,
                icon: 'ic_service_cost-explorer',
                dataSourceId,
                parents: [{
                    name: dataSourceId,
                    label: dataSourceMap[dataSourceId].label,
                }],
                isDeleted: false,
            };

            if (!groupedResults[dataSourceId]) {
                groupedResults[dataSourceId] = [];
            }
            groupedResults[dataSourceId].push(item);
        }
    });

    const reorderedConfig: ConfigData[] = [];
    costQuerySetList.forEach((menu) => {
        const configItem = config.find((item) => item.itemId === menu.cost_query_set_id);
        if (configItem) {
            reorderedConfig.push(configItem);
        }
    });

    reorderedConfig.forEach((d) => {
        const resource: CostQuerySetModel|undefined = find(costQuerySetList, { cost_query_set_id: d.itemId });
        if (resource) {
            const item: ReferenceData = {
                ...d,
                name: resource.cost_query_set_id,
                label: resource.name,
                updatedAt: d.updatedAt,
                icon: 'ic_service_cost-explorer',
                dataSourceId: resource.data_source_id,
                parents: [{
                    name: resource.data_source_id,
                    label: dataSourceMap[resource.data_source_id].label,
                }],
                isDeleted: false,
            };

            if (!groupedResults[resource.data_source_id]) {
                groupedResults[resource.data_source_id] = [];
            }
            groupedResults[resource.data_source_id].push(item);
        } else {
            results.push({
                ...d,
                isDeleted: !resource,
            });
        }
    });

    Object.values(groupedResults).forEach((group) => {
        results.push(...group);
    });

    return results;
};

export const convertDashboardConfigToReferenceData = (config: ConfigData[]|null, dashboardList): ReferenceData[] => {
    const results: ReferenceData[] = [];
    if (!config) return results;

    // Create a map to quickly find the index of each dashboard
    const dashboardMap: { [key: string]: number } = {};
    dashboardList.forEach((dashboard, index) => {
        dashboardMap[dashboard.public_dashboard_id || dashboard.private_dashboard_id] = index;
    });

    config.forEach((d) => {
        const resource: DashboardModel|undefined = find(dashboardList, { public_dashboard_id: d.itemId })
            || find(dashboardList, { private_dashboard_id: d.itemId });
        if (resource) {
            const index = dashboardMap[resource.public_dashboard_id || resource.private_dashboard_id || ''];
            results[index] = {
                ...d,
                name: resource.public_dashboard_id || resource.private_dashboard_id,
                label: resource.name,
                icon: 'ic_service_dashboard',
            };
        } else {
            results.push({
                ...d,
                isDeleted: !resource,
            });
        }
    });

    return results.filter((result) => result);
};

export const convertWorkspaceConfigToReferenceData = (config: ConfigData[]|null, menuList: WorkspaceModel[]): ReferenceData[] => {
    const results: ReferenceData[] = [];
    if (!config) return results;

    config.forEach((d) => {
        const menu = find(menuList, { workspace_id: d.itemId });
        if (menu) {
            results.push({
                ...d,
                itemType: FAVORITE_TYPE.WORKSPACE,
                itemId: menu.workspace_id,
                name: menu.workspace_id,
                label: menu.name,
                tags: menu.tags,
            });
        } else {
            results.push({
                ...d,
                isDeleted: !menu,
            });
        }
    });
    return results;
};

export const getCompoundKeyWithManagedCostQuerySetFavoriteKey = (dataSourceId:string, costQuerySetId: string): string => `managed_${dataSourceId}_${costQuerySetId}`;
export const getParsedKeysWithManagedCostQueryFavoriteKey = (managedCostQuerySetId?: string): [string, string]|undefined => {
    if (!managedCostQuerySetId?.startsWith('managed_')) return undefined;
    const [, dataSourceId, costQuerySetId] = managedCostQuerySetId.split('_');
    return [dataSourceId, costQuerySetId];
};
