import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel, JobModel, Schedule } from '@/services/asset-inventory/collector/model';


const jobQueryHelper = new ApiQueryHelper().setPageLimit(5).setSort('created_at', true);
export const useCollectorJobStore = defineStore('collector-job', {
    state: () => ({
        collector: null as null|CollectorModel,
        recentJobs: null as JobModel[]|null, // if null, it means that the first request is not yet finished
    }),
    getters: {
        schedule(): Schedule|null {
            return this.collector?.schedule ?? null;
        },
        isRecentJobLoaded(): boolean {
            return this.recentJobs !== null;
        },
        recentJob(): JobModel|null {
            return this.recentJobs?.[0] ?? null;
        },
    },
    actions: {
        async getRecentJob() {
            try {
                if (!this.collector) throw new Error('[useCollectorJobStore] No collector');

                jobQueryHelper.setFilters([
                    { k: 'collector_id', v: this.collector.collector_id, o: '=' },
                ]);
                const { results } = await SpaceConnector.client.inventory.job.list({
                    query: jobQueryHelper.data,
                });
                this.recentJobs = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                this.recentJobs = [];
            }
        },
    },
});
