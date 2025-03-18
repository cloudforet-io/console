import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type {
    CollectorModel,
} from '@/schema/inventory/collector/model';
import type { JobListParameters } from '@/schema/inventory/job/api-verbs/list';
import type { JobModel } from '@/schema/inventory/job/model';
import type { SecretModel } from '@/schema/secret/secret/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { COLLECT_DATA_TYPE } from '@/services/asset-inventory/constants/collector-constant';
import type { CollectDataType } from '@/services/asset-inventory/types/collector-data-modal-type';


/**
    * @name useCollectorDataModalStore
 * @description This directory contains modal forms for re-collecting the collector.
 *              By default, the components use the information of the selected item when the modal is activated.
 *              Therefore, in order to use the components, the relevant information should be stored in the store.
 * @example
 * import {
 *     useCollectorDataModalStore,
 * } from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';
 *
 * const collectorDataModalStore = useCollectorDataModalStore();
 */

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
                const { results } = await SpaceConnector.clientV2.inventory.job.list<JobListParameters, ListResponse<JobModel>>({ collector_id: collectorId });
                if ((results ?? []).length > 0 && results) {
                    if (this.selectedSecret) {
                        const filteredJobs = results.filter((job) => job.secret_id);
                        this.recentJob = filteredJobs[0];
                    } else {
                        const filteredJobs = results.filter((job) => !job.secret_id);
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
