import { reactive } from 'vue';

import { defineStore } from 'pinia';


import type {
    CostLinkedAccountModalType,
} from '@/services/cost-explorer/types/data-sources-type';


export const useDataSourcesPageStore = defineStore('page-data-sources', () => {
    const state = reactive({
        selectedDataSourceId: undefined as string|undefined,
        selectedLinkedAccountIds: [] as string[],

        modalVisible: false,
        modalType: undefined as CostLinkedAccountModalType|undefined,
    });

    const mutation = {
        setSelectedDataSourceId: (id: string|undefined) => {
            state.selectedDataSourceId = id;
        },
        setSelectedLinkedAccountIds: (ids: string[]) => {
            state.selectedLinkedAccountIds = ids;
        },
        setModalVisible: (visible: boolean) => {
            state.modalVisible = visible;
        },
        setModalType: (type: CostLinkedAccountModalType) => {
            state.modalType = type;
        },
    };

    return {
        state,
        ...mutation,
    };
});
