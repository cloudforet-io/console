import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel, JobModel, Schedule } from '@/services/asset-inventory/collector/model';

const allJobsCountQueryHelper = new ApiQueryHelper().setCountOnly();
const jobQueryHelper = new ApiQueryHelper().setSort('created_at', true);
export const useCollectorJobStore = defineStore('collector-job', {
    state: () => ({
        collector: null as null|CollectorModel,
        recentJobs: null as JobModel[]|null, // if null, it means that the first request is not yet finished
        allJobsCount: undefined as number|undefined,
    }),
    getters: {
        schedule(): Schedule|null {
            return this.collector?.schedule ?? null;
        },
        AllJobsInfoLoaded(): boolean {
            return this.recentJobs !== null && this.allJobsCount !== undefined;
        },
        hasJobs(): boolean {
            return !!this.allJobsCount || !!this.recentJobs?.length;
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
        async getAllJobsCount() {
            try {
                if (!this.collector) throw new Error('[useCollectorJobStore][getAllJobsCount] No collector');
                allJobsCountQueryHelper.setFilters([
                    { k: 'collector_id', v: this.collector.collector_id, o: '=' },
                ]);
                const { total_count } = await SpaceConnector.client.inventory.job.list({
                    query: allJobsCountQueryHelper.data,
                });
                this.allJobsCount = total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                this.allJobsCount = 0;
            }
        },
        async getRecentJobs() {
            try {
                if (!this.collector) throw new Error('[useCollectorJobStore][getRecentJobs] No collector');
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
