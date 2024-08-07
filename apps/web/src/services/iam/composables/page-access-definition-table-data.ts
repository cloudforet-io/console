import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';


import { i18n } from '@/translations';

import type { PageAccessPermissionMap } from '@/lib/access-control/config';
import {
    getPageAccessPermissionMapFromRawData,
} from '@/lib/access-control/page-access-helper';
import type { Menu } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

interface PageAccessDefinitionTableData {
    label?: TranslateResult;
    data: Record<string, boolean>;
    fields: DefinitionField[];
}
const flattenPageAccessDefinitionData = (pagePermissionMap: PageAccessPermissionMap, subMenuList: Menu[], labels: Array<string|TranslateResult> = []): PageAccessDefinitionTableData => {
    let result: PageAccessDefinitionTableData = {
        data: {},
        fields: [],
    };
    subMenuList.forEach((subMenu) => {
        const menuInfo = MENU_INFO_MAP[subMenu.id];
        const _labels = [...labels, i18n.t(menuInfo.translationId)];
        if (subMenu.subMenuList?.length) {
            result = {
                ...flattenPageAccessDefinitionData(pagePermissionMap, subMenu.subMenuList, _labels),
            };
        } else {
            result.data[subMenu.id] = pagePermissionMap[subMenu.id];
            result.fields.push({
                name: subMenu.id,
                label: _labels.length > 1 ? _labels.slice(1, _labels.length).join(' > ') : _labels.toString(),
            });
        }
    });
    return result;
};
// eslint-disable-next-line max-len
export const usePageAccessDefinitionTableData = (pagePermissionData: ComputedRef<string[]>): ComputedRef<PageAccessDefinitionTableData[]> => computed<PageAccessDefinitionTableData[]>(() => {
    const pagePermissionMap = getPageAccessPermissionMapFromRawData(pagePermissionData.value);
    const results: PageAccessDefinitionTableData[] = [];
    MENU_LIST.forEach((menu) => {
        if (!menu.needPermissionByRole) return;
        const menuInfo = MENU_INFO_MAP[menu.id];
        const definitionTableData = flattenPageAccessDefinitionData(pagePermissionMap, [menu]);
        if (Object.values(definitionTableData.data).every((value) => value === undefined)) return;
        results.push({
            label: i18n.t(menuInfo.translationId),
            ...flattenPageAccessDefinitionData(pagePermissionMap, [menu]),
        });
    });
    return results;
});
