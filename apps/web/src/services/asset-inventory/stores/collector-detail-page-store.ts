import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CollectorGetParameters } from '@/schema/inventory/collector/api-verbs/get';
import type { CollectorModel } from '@/schema/inventory/collector/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const useCollectorDetailPageStore = defineStore('page-collector-detail', () => {
    const appContextStore = useAppContextStore();

    const state = reactive({
        collector: {} as Partial<CollectorModel>,
    });

    const getters = reactive({
        isManagedCollector: computed<boolean>(() => state.collector?.workspace_id === '*'),
        isEditableCollector: computed(() => {
            if (appContextStore.getters.isAdminMode) {
                return true;
            }
            return !getters.isManagedCollector;
        }),
    });


    const action = {
        fetchCollector: async (collectorId: string) => {
            try {
                state.collector = await SpaceConnector.clientV2.inventory.collector.get<CollectorGetParameters, CollectorModel>({
                    collector_id: collectorId,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        reset: () => {
            state.collector = {};
        },
    };

    return {
        state,
        getters,
        ...action,
    };
});
