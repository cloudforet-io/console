import { defineStore } from 'pinia';

import type { CollectorModel } from '@/services/asset-inventory/collector/type';

export const useCollectorPageStore = defineStore('collector-page', {
    state: () => ({
        selectedProvider: 'all',
        collectorList: undefined as CollectorModel[] | undefined,
    }),
    actions: {
        async setSelectedProvider(provider) {
            this.selectedProvider = provider;
        },
        async setCollectorList(collectorList) {
            this.collectorList = collectorList;
        },
    },
});
