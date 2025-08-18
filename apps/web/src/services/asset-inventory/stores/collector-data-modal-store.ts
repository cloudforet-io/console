import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { SecretModel } from '@/api-clients/secret/secret/schema/model';

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

export const useCollectorDataModalStore = defineStore('collector-data-modal', () => {
    const state = reactive({
        // Required
        visible: false, // Determine the visibility of the collector-data-modal.
        selectedCollectorId: undefined as string|undefined,
        collectDataType: COLLECT_DATA_TYPE.ENTIRE as CollectDataType, // This is the state for distinguishing between overall collection and collection per account.

        // Optional
        selectedSecret: undefined as SecretModel|undefined, // In detail page, This state is used for API.
    });

    const mutations = {
        setVisible: (visible: boolean) => {
            state.visible = visible;
        },
        setSelectedCollectorId: (collectorId?: string) => {
            state.selectedCollectorId = collectorId;
        },
        setCollectDataType: (collectDataType: CollectDataType) => {
            state.collectDataType = collectDataType;
        },
        setSelectedSecret: (secret?: SecretModel) => {
            state.selectedSecret = secret;
        },
    };

    const actions = {
        reset: () => {
            state.visible = false;
            state.selectedCollectorId = undefined;
            state.collectDataType = COLLECT_DATA_TYPE.ENTIRE;
            state.selectedSecret = undefined;
        },
    };

    return {
        state,
        ...actions,
        ...mutations,
    };
});
