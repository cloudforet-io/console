import { find } from 'lodash';
import { getAllMenuList } from '@/lib/helper/menu-helper';
import { FAVORITE_TYPE, FavoriteConfig, FavoriteItem } from '@/store/modules/favorite/type';
import { RecentConfig, RecentItem } from '@/store/modules/recent/type';
import { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import { Menu } from '@/store/modules/display/type';
import { MENU_ICON } from '@/common/modules/navigations/gnb/config';


type ConfigData = FavoriteConfig | RecentConfig;
type ReferenceData = FavoriteItem | RecentItem;

export const convertMenuConfigToReferenceData = (config: ConfigData[], menuList: Menu[]): ReferenceData[] => {
    const allMenuList = getAllMenuList(menuList);
    const results: FavoriteItem[] = [];
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
            });
        }
    });
    return results;
};

export const convertProjectConfigToReferenceData = (config: ConfigData[], projectReference: ProjectReferenceMap): ReferenceData[] => config.map((d) => {
    const resource = projectReference[d.itemId];
    const result = {
        ...d,
        name: d.itemId,
        label: resource?.name || d.itemId,
        icon: 'ic_tree_project',
    };
    if (resource?.data?.groupInfo?.id) {
        return {
            ...result,
            parents: [{
                name: resource?.data?.groupInfo?.id,
                label: resource?.data?.groupInfo?.name,
            }],
        };
    }
    return result;
});

export const convertProjectGroupConfigToReferenceData = (config: ConfigData[], projectGroupReference: ProjectGroupReferenceMap): ReferenceData[] => config.map((d) => {
    const resource = projectGroupReference[d.itemId];
    const result = {
        ...d,
        name: d.itemId,
        label: resource?.name || d.itemId,
        icon: 'ic_tree_project-group',
    };
    if (resource?.data?.parentGroupInfo?.id) {
        return {
            ...result,
            parents: [{
                name: resource?.data?.parentGroupInfo?.id,
                label: resource?.data?.parentGroupInfo?.name,
            }],
        };
    }
    return result;
});

export const convertCloudServiceConfigToReferenceData = (config: ConfigData[], cloudServiceReference: CloudServiceTypeReferenceMap) => config.map((d) => {
    const resource = cloudServiceReference[d.itemId];
    return {
        ...d,
        name: d.itemId,
        label: resource?.name || d.itemId,
        icon: resource?.icon,
        provider: resource?.data?.provider,
        parents: [{
            name: resource?.data?.group,
            label: resource?.data?.group,
        }],
    };
});
