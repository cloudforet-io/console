import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel, JobModel, Schedule } from '@/services/asset-inventory/collector/model';


const jobQueryHelper = new ApiQueryHelper().setSort('created_at', true);
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
        recentJobForAllAccounts(): JobModel|null {
            if (Array.isArray(this.recentJobs) && this.recentJobs.length > 0) {
                const filteredJobs = this.recentJobs.filter((job) => !job.secret_id);
                return filteredJobs[0] ?? null;
            }
            return null;
        },
    },
    actions: {
        async getRecentJob() {
            try {
                if (!this.collector) throw new Error('[useCollectorJobStore] No collector');
                const fiveDaysAgo = dayjs.utc().subtract(5, 'day').toISOString();
                jobQueryHelper.setFilters([
                    { k: 'collector_id', v: this.collector.collector_id, o: '=' },
                    { k: 'created_at', v: fiveDaysAgo, o: '>' },
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
