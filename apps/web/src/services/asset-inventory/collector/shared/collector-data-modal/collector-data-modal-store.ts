import { defineStore } from 'pinia';

import type { CollectorModel, SecretModel, JobStatus } from '@/services/asset-inventory/collector/model';
import type { CollectDataType } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';
import { COLLECT_DATA_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

interface RecentJob {
    jobId: string;
    status: JobStatus;
    secretId?: string;
}

export const useCollectorDataModalStore = defineStore('collector-data-modal', {
    state: () => ({
        // Required
        visible: false, // Determine the visibility of the collector-data-modal.
        recentJob: undefined as RecentJob|null|undefined, // Determine the theme-color of the p-button-modal, duration, status.
        selectedCollector: undefined as CollectorModel|null|undefined, // This state is used for API.
        collectDataType: COLLECT_DATA_TYPE.ENTIRE as CollectDataType, // This is the state for distinguishing between overall collection and collection per account.

        // Optional
        selectedSecret: undefined as SecretModel|undefined, // In detail page, This state is used for API.
    }),
});
