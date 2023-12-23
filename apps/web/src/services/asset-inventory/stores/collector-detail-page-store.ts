import { computed, reactive, ref } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CollectorGetParameters } from '@/schema/inventory/collector/api-verbs/get';
import type { CollectorModel } from '@/schema/inventory/collector/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';



export const useCollectorDetailPageStore = defineStore('collector-detail-page', () => {
    const appContextStore = useAppContextStore();

    const collector = ref<Partial<CollectorModel>>({});

    const getters = reactive({
        isManagedCollector: computed(() => collector.value?.workspace_id === '*' ?? false),
        isEditableCollector: computed(() => {
            if (appContextStore.getters.isAdminMode) {
                return true;
            }
            if (getters.isManagedCollector) {
                return false;
            }
            return true;
        }),
    });


    const action = {
        fetchCollector: async (collectorId: string) => {
            try {
                const res = await SpaceConnector.clientV2.inventory.collector.get<CollectorGetParameters, CollectorModel>({
                    collector_id: collectorId,
                });
                collector.value = res;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        reset: () => {
            collector.value = {};
        },
    };

    return {
        collector,
        getters,
        ...action,
    };
});
