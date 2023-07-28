import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { JobModel } from '@/services/asset-inventory/collector/model';


const jobQueryHelper = new ApiQueryHelper().setPageLimit(1);
export const useCollectorJobStore = defineStore('collector-job', {
    state: () => ({
        collectorId: undefined as undefined|string,
        recentJob: null as null|JobModel,
    }),
    actions: {
        async getRecentJob() {
            try {
                if (!this.collectorId) throw new Error('[useCollectorJobStore] No collectorId');
                jobQueryHelper.setFilters([
                    { k: 'collector_id', v: this.collectorId, o: '=' },
                ]);
                const { results } = await SpaceConnector.client.inventory.job.list({
                    query: jobQueryHelper.data,
                });
                this.recentJob = results?.[0] ?? null;
                if (!this.recentJob) throw new Error('[useCollectorJobStore] No recentJob');
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    },
});
