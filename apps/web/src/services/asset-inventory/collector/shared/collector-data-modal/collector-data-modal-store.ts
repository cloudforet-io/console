import { defineStore } from 'pinia';

import type { CollectorModel, SecretModel } from '@/services/asset-inventory/collector/model';
import { ATTACHED_ACCOUNT_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

interface RecentJob {
    status: string;
}

export const useCollectorDataModalStore = defineStore('collector-data-modal', {
    state: () => ({
        // Required
        visible: false, // Determine the visibility of the collector-data-modal.
        recentJob: {} as RecentJob, // Determine the theme-color of the p-button-modal, duration, status.
        selectedCollector: {} as CollectorModel, // This state is used for API.
        accountType: ATTACHED_ACCOUNT_TYPE.ALL, // In detail page, This state is used for account type.

        // Optional
        selectedSecret: {} as SecretModel, // In detail page, This state is used for API.
        secrets: [] as SecretModel[], // In detail page, This state is used for account count.
    }),
});
