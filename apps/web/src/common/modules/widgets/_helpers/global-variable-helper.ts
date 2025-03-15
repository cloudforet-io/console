// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

export const isGlobalVariableFormat = (value: string | MenuItem[]): boolean => {
    if (Array.isArray(value)) return false;
    const regex = /^\{\{\s*global\.[^\s]+\s*\}\}$/;
    return regex.test(value);
};

export const normalizeAndSerializeVars = (obj: DashboardVars = {}): string => {
    const sortedKeys = Object.keys(obj).sort();

    const normalizedObj: DashboardVars = sortedKeys.reduce((acc, key) => {
        const value = obj[key];

        if (Array.isArray(value)) {
            acc[key] = [...value].sort();
        } else {
            acc[key] = value;
        }

        return acc;
    }, {} as DashboardVars);

    return JSON.stringify(normalizedObj);
};
