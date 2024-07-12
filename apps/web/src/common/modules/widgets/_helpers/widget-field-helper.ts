import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';


export const getDefaultMenuItemIndex = (menuItems: MenuItem[], idx = 0, excludeDateField = false): number => {
    if (!excludeDateField) return idx;
    const _dateFieldCount = menuItems.filter((item) => Object.values(DATE_FIELD).includes(item.name as string)).length;
    return idx + _dateFieldCount;
};


export const getInitialSelectedMenuItem = (menuItems: MenuItem[], data: string[]|string, defaultIdx = 0): string|string[]|undefined => {
    if (Array.isArray(data)) {
        const _filteredData = data.filter((d) => menuItems.some((m) => m.name === d));
        if (_filteredData.length) return _filteredData;
        if (menuItems[defaultIdx]?.name) return [menuItems[defaultIdx].name];
        return [];
    }
    const isDataIncluded = menuItems.some((m) => m.name === data);
    if (isDataIncluded) return data;
    return menuItems[defaultIdx]?.name;
};
