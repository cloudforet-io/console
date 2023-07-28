import { defineStore } from 'pinia';

import type { CollectorModel, SecretModel, JobStatus } from '@/services/asset-inventory/collector/model';
import type {
    AttachedAccountType,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/type';
import {
    ATTACHED_ACCOUNT_TYPE,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

interface RecentJob {
    status: JobStatus;
}

export const useCollectorDataModalStore = defineStore('collector-data-modal', {
    state: () => ({
        // Required
        visible: false, // Determine the visibility of the collector-data-modal.
        recentJob: undefined as RecentJob|null|undefined, // Determine the theme-color of the p-button-modal, duration, status.
        selectedCollector: undefined as CollectorModel|null|undefined, // This state is used for API.
        accountType: ATTACHED_ACCOUNT_TYPE.ALL as AttachedAccountType, // In detail page, This state is used for account type.

        // Optional
        selectedSecret: {} as SecretModel, // In detail page, This state is used for API.
        secrets: [] as SecretModel[], // In detail page, This state is used for account count.
    }),
});
