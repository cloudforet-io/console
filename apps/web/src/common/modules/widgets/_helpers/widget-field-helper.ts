// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type { DateFieldType } from '@/common/modules/widgets/types/widget-data-type';


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

export const isDateField = (fieldName?: DateFieldType) => fieldName && Object.values(DATE_FIELD).includes(fieldName);
export const isIncludingDateField = (fieldNames: string[]) => Object.values(DATE_FIELD).some((field) => fieldNames.includes(field));

export const integrateFieldsSchema = (requiredFieldsSchema: WidgetConfig['requiredFieldsSchema'], optionalFieldsSchema: WidgetConfig['optionalFieldsSchema']) => ({
    ...requiredFieldsSchema,
    ...optionalFieldsSchema,
});
