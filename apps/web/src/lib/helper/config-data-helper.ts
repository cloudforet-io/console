import { find } from 'lodash';

import type { DisplayMenu } from '@/store/modules/display/type';
import type { FavoriteConfig, FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { RecentConfig, RecentItem } from '@/store/modules/recent/type';
import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { ProjectReferenceItem, ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';

import { getAllSuggestionMenuList } from '@/lib/helper/menu-suggestion-helper';

import type { CostQuerySetModel } from '@/services/cost-explorer/type';
import type { DashboardScope } from '@/services/dashboards/config';
import { DASHBOARD_SCOPE } from '@/services/dashboards/config';
import type { DashboardModel } from '@/services/dashboards/model';

type Config = FavoriteConfig & RecentConfig;

interface ConfigData extends Config {
    [key: string]: any;
}

type ReferenceItem = FavoriteItem & RecentItem;

interface ReferenceData extends ReferenceItem {
    [key: string]: any;
}

export const convertMenuConfigToReferenceData = (config: ConfigData[]|null, menuList: DisplayMenu[]): ReferenceData[] => {
    const allMenuList = getAllSuggestionMenuList(menuList);
    const results: ReferenceData[] = [];
    if (!config) return results;

    config.forEach((d) => {
        const menu = find(allMenuList, { id: d.itemId });
        if (menu) {
            results.push({
                itemType: FAVORITE_TYPE.MENU,
                itemId: menu.id,
                name: menu.id,
                label: menu.label,
                icon: menu.parents?.[0]?.icon ?? menu.icon,
                parents: menu.parents,
                updatedAt: d?.updatedAt,
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
                updatedAt: d?.updatedAt,
            };
            if (resource?.data?.parentGroupInfo?.id) {
                result.parents = [{
                    name: resource.data?.parentGroupInfo?.id,
                    label: resource.data?.parentGroupInfo?.name,
                }];
            }
            results.push(result);
        }
    });
    return results;
};

export const convertCloudServiceConfigToReferenceData = (config: ConfigData[]|null, cloudServiceReference: CloudServiceTypeReferenceMap) => {
    const results: ReferenceData[] = [];
    if (!config) return results;

    config.forEach((d) => {
        const resource = Object.values(cloudServiceReference)
            .find((c) => c.data.cloudServiceTypeKey === d.itemId);
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
        }
    });
    return results;
};

export const convertCostAnalysisConfigToReferenceData = (config: ConfigData[]|null, costQuerySetList: CostQuerySetModel[]): ReferenceData[] => {
    const results: ReferenceData[] = [];
    if (!config) return results;

    config.forEach((d) => {
        const resource: CostQuerySetModel|undefined = find(costQuerySetList, { cost_query_set_id: d.itemId });
        if (resource) {
            results.push({
                ...d,
                name: resource.cost_query_set_id,
                label: resource.name,
                updatedAt: d.updatedAt,
                icon: 'ic_service_cost-explorer',
                dataSourceId: resource.data_source_id,
            });
        }
    });
    return results;
};

export const convertDashboardConfigToReferenceData = (config: ConfigData[]|null, dashboardList: DashboardModel[], type: DashboardScope): ReferenceData[] => {
    const results: ReferenceData[] = [];
    const dashboardId = type === DASHBOARD_SCOPE.DOMAIN ? 'domain_dashboard_id' : 'project_dashboard_id';
    if (!config) return results;

    config.forEach((d) => {
        const resource: DashboardModel|undefined = find(dashboardList, { [dashboardId]: d.itemId });
        if (resource) {
            results.push({
                ...d,
                name: resource[dashboardId],
                label: resource.name,
                updatedAt: d.updatedAt,
                icon: 'ic_service_dashboard',
            });
        }
    });
    return results;
};
