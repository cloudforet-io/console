import type { TranslateResult } from 'vue-i18n';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import { useRoleFormatter } from '@/services/advanced/composables/refined-table-data';

export const useRoleFormatters = () => {
    const userReferenceStore = useUserReferenceStore();
    const getRoleImage = (userId: string): string => {
        const _roleType = userReferenceStore.getters.userItems[userId]?.data?.roleInfo?.role_type;
        const _roleInfo = _roleType ? useRoleFormatter(_roleType) : undefined;
        return _roleInfo?.image ?? '';
    };
    const getRoleName = (userId: string): TranslateResult => {
        const _roleType = userReferenceStore.getters.userItems[userId]?.data?.roleInfo?.role_type;
        const _roleInfo = _roleType ? useRoleFormatter(_roleType) : undefined;
        return _roleInfo?.name ?? '';
    };

    return {
        getRoleImage, getRoleName,
    };
};
