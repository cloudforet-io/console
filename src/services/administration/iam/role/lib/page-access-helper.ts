import { TranslateResult } from 'vue-i18n';

import { getPermissionRequiredMenuIds, PagePermissionMap } from '@/lib/access-control/page-permission-helper';
import { Menu } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { PageAccessDefinitionTableData, PageAccessMenuItem } from '@/services/administration/iam/role/type';

// Page Access Form
const flattenSubMenuList = (subMenuList?: Menu[], labels?: Array<string|TranslateResult>): PageAccessMenuItem[] => {
    if (!subMenuList) return [];
    let results: PageAccessMenuItem[] = [];
    subMenuList.forEach((subMenu) => {
        const permissionRequiredMenuIdList = getPermissionRequiredMenuIds();
        if (!permissionRequiredMenuIdList.includes(subMenu.id)) return;

        const menuInfo = MENU_INFO_MAP[subMenu.id];
        if (subMenu.subMenuList?.length) {
            results = results.concat(flattenSubMenuList(subMenu.subMenuList, [...labels || [], menuInfo.label]));
        } else {
            results.push({
                id: subMenu.id,
                labels: [...labels || [], menuInfo.label],
                isViewed: false,
                isManaged: false,
                hideMenu: false,
            });
        }
    });
    return results;
};
export const getPageAccessMenuList = (): PageAccessMenuItem[] => {
    const permissionRequiredMenuIdList = getPermissionRequiredMenuIds();
    const results: PageAccessMenuItem[] = [];
    MENU_LIST.forEach((menu) => {
        if (permissionRequiredMenuIdList.includes(menu.id)) {
            const menuInfo = MENU_INFO_MAP[menu.id];
            results.push({
                id: menu.id,
                labels: [menuInfo.label],
                isViewed: false,
                isManaged: false,
                hideMenu: false,
                isParent: true,
                subMenuList: flattenSubMenuList(menu?.subMenuList),
            });
        }
    });
    return results;
};


// Page Access Detail
const flattenPageAccessDefinitionData = (pagePermissionMap: PagePermissionMap, subMenuList: Menu[], labels: Array<string|TranslateResult> = []): PageAccessDefinitionTableData => {
    let result: PageAccessDefinitionTableData = {
        data: {},
        fields: [],
    };
    subMenuList.forEach((subMenu) => {
        const menuInfo = MENU_INFO_MAP[subMenu.id];
        const _labels = [...labels, menuInfo.label];
        if (subMenu.subMenuList?.length) {
            result = {
                ...flattenPageAccessDefinitionData(pagePermissionMap, subMenu.subMenuList, _labels),
            };
        } else {
            result.data[subMenu.id] = pagePermissionMap[subMenu.id] || '--';
            result.fields.push({
                name: subMenu.id,
                label: _labels.length > 1 ? _labels.slice(1, _labels.length).join(' > ') : _labels.toString(),
            });
        }
    });
    return result;
};
export const getPageAccessDefinitionTableData = (pagePermissionMap: PagePermissionMap): PageAccessDefinitionTableData[] => {
    const results: PageAccessDefinitionTableData[] = [];
    MENU_LIST.forEach((menu) => {
        const permissionRequiredMenuIdList = getPermissionRequiredMenuIds();
        if (!permissionRequiredMenuIdList.includes(menu.id)) return;
        const menuInfo = MENU_INFO_MAP[menu.id];
        results.push({
            label: menuInfo.label,
            ...flattenPageAccessDefinitionData(pagePermissionMap, [menu]),
        });
    });
    return results;
};
