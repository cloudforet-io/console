import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';


export const getDefaultMenuItemIndex = (menuItems: MenuItem[], idx = 0, excludeDateField = false): number => {
    if (!excludeDateField) return idx;
    const _dateFieldCount = menuItems.filter((item) => Object.values(DATE_FIELD).includes(item.name as string)).length;
    return idx + _dateFieldCount;
};

export const getInitialSelectedMenuItem = (menuItems: MenuItem[], data?: string[]|string, idx = 0): string|Array<string|undefined>|undefined => {
    if (!data) return menuItems[idx]?.name;
    if (Array.isArray(data)) {
        if (data.length === 0) return [menuItems[0]?.name];
        const isAllDataIncluded = data.every((d) => menuItems.some((m) => m.name === d));
        if (isAllDataIncluded) return data;
        return [menuItems[idx]?.name];
    }
    const isAllDataIncluded = menuItems.some((m) => m.name === data);
    if (isAllDataIncluded) return data;
    return menuItems[idx]?.name;
};
