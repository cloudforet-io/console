import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';


export const getDefaultMenuItemIndex = (menuItems: MenuItem[], idx = 0, excludeDateField = false): number => {
    if (!excludeDateField) return idx;
    const _dateFieldCount = menuItems.filter((item) => Object.values(DATE_FIELD).includes(item.name as string)).length;
    return idx + _dateFieldCount;
};
