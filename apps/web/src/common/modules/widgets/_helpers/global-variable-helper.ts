import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

export const isGlobalVariableFormat = (value: string | MenuItem[]): boolean => {
    if (Array.isArray(value)) return false;
    const regex = /^\{\{\s*global\.[^\s]+\s*\}\}$/;
    return regex.test(value);
};
