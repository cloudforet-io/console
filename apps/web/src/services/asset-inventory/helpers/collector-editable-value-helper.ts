import type { CollectorModel } from '@/api-clients/inventory/collector/schema/model';

export const getIsEditableCollector = (isAdminMode: boolean, collector?: CollectorModel) => {
    if (!collector) return false;
    if (isAdminMode) {
        return true;
    }
    const isManagedCollector = collector?.workspace_id === '*';
    return !isManagedCollector;
};
