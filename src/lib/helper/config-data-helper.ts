import { find } from 'lodash';
import { getAllMenuList } from '@/lib/helper/menu-helper';
import { FAVORITE_TYPE, FavoriteConfig, FavoriteItem } from '@/store/modules/favorite/type';
import { RecentConfig, RecentItem } from '@/store/modules/recent/type';
import { ProjectReferenceItem, ProjectReferenceMap } from '@/store/modules/reference/project/type';
import { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import { Menu } from '@/store/modules/display/type';
import { MENU_ICON } from '@/common/modules/navigations/gnb/config';


interface ConfigData extends FavoriteConfig, RecentConfig {
    [key: string]: any;
}
interface ReferenceData extends FavoriteItem, RecentItem {
    [key: string]: any;
}

export const convertMenuConfigToReferenceData = (config: ConfigData[]|null, menuList: Menu[]): ReferenceData[] => {
    const allMenuList = getAllMenuList(menuList);
    const results: ReferenceData[] = [];
    if (config) {
        config.forEach((d) => {
            const menu = find(allMenuList, { id: d.itemId });
            if (menu) {
                results.push({
                    itemType: FAVORITE_TYPE.MENU,
                    itemId: menu.id,
                    name: menu.id,
                    label: menu.label,
                    icon: MENU_ICON[menu.parents?.[0]?.id ?? menu.id],
                    parents: menu?.parents,
                    updatedAt: d?.updatedAt,
                });
            }
        });
    }
    return results;
};

export const convertProjectConfigToReferenceData = (config: ConfigData[]|null, projectReference: ProjectReferenceMap): ReferenceData[] => {
    const results: ReferenceData[] = [];
    if (config) {
        config.forEach((d) => {
            const resource: ProjectReferenceItem = projectReference[d.itemId];
            if (resource) {
                const result: ReferenceData = {
                    ...d,
                    name: d.itemId,
                    label: resource?.name || d.itemId,
                    icon: 'ic_tree_project',
                    updatedAt: d?.updatedAt,
                };
                if (resource?.data?.groupInfo?.id) {
                    result.parents = [{
                        name: resource?.data?.groupInfo?.id,
                        label: resource?.data?.groupInfo?.name,
                    }];
                }
                results.push(result);
            }
        });
    }
    return results;
};

export const convertProjectGroupConfigToReferenceData = (config: ConfigData[]|null, projectGroupReference: ProjectGroupReferenceMap): ReferenceData[] => {
    const results: ReferenceData[] = [];
    if (config) {
        config.forEach((d) => {
            const resource: ProjectGroupReferenceItem = projectGroupReference[d.itemId];
            if (resource) {
                const result: ReferenceData = {
                    ...d,
                    name: d.itemId,
                    label: resource?.name || d.itemId,
                    icon: 'ic_tree_project-group',
                    updatedAt: d?.updatedAt,
                };
                if (resource?.data?.parentGroupInfo?.id) {
                    result.parents = [{
                        name: resource?.data?.parentGroupInfo?.id,
                        label: resource?.data?.parentGroupInfo?.name,
                    }];
                }
                results.push(result);
            }
        });
    }
    return results;
};

export const convertCloudServiceConfigToReferenceData = (config: ConfigData[]|null, cloudServiceReference: CloudServiceTypeReferenceMap) => {
    const results: ReferenceData[] = [];
    if (config) {
        config.forEach((d) => {
            const resource = Object.values(cloudServiceReference)
                .find(c => c.data.cloudServiceTypeKey === d.itemId);
            if (resource) {
                results.push({
                    ...d,
                    name: d.itemId,
                    label: resource?.name || d.itemId,
                    icon: resource?.icon,
                    provider: resource?.data?.provider,
                    parents: [{
                        name: resource?.data?.group,
                        label: resource?.data?.group,
                    }],
                    updatedAt: d?.updatedAt,
                });
            }
        });
    }
    return results;
};
