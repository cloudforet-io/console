import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { defineStore } from 'pinia';


import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    CollectorModel, SecretModel, JobModel,
} from '@/services/asset-inventory/collector/model';
import type { CollectDataType } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';
import { COLLECT_DATA_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

export const useCollectorDataModalStore = defineStore('collector-data-modal', {
    state: () => ({
        initLoading: true,
        recentJob: undefined as JobModel|null|undefined,
        // Required
        visible: false, // Determine the visibility of the collector-data-modal.
        selectedCollector: undefined as CollectorModel|null|undefined, // This state is used for API.
        collectDataType: COLLECT_DATA_TYPE.ENTIRE as CollectDataType, // This is the state for distinguishing between overall collection and collection per account.

        // Optional
        selectedSecret: undefined as SecretModel|undefined, // In detail page, This state is used for API.
    }),
    actions: {
        async getJobs(collectorId: string) {
            this.initLoading = true;
            try {
                const res = await SpaceConnector.client.inventory.job.list({ collector_id: collectorId });
                if (res.results.length > 0) {
                    if (this.selectedSecret) {
                        const filteredJobs = res.results.filter((job) => job.secret_id);
                        this.recentJob = filteredJobs[0];
                    } else {
                        const filteredJobs = res.results.filter((job) => !job.secret_id);
                        this.recentJob = filteredJobs[0];
                    }
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                this.initLoading = false;
            }
        },
    },
});
