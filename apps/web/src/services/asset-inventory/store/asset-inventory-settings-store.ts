import { defineStore } from 'pinia';

import { initServiceSettingsStore } from '@/store/util';


interface AssetInventorySettingsStore {
    cloudServiceTableHeight: number;
    cloudServiceTablePageLimit: number;
}

export const DEFAULT_TABLE_PAGE_LIMIT = 15;
export const TABLE_MIN_HEIGHT = 400;

export const useAssetInventorySettingsStore = defineStore('asset-inventory-settings', {
    state: (): AssetInventorySettingsStore => {
        const localStorageItem = initServiceSettingsStore<AssetInventorySettingsStore>('assetInventory');
        return ({
            cloudServiceTableHeight: localStorageItem?.cloudServiceTableHeight ?? TABLE_MIN_HEIGHT,
            cloudServiceTablePageLimit: localStorageItem?.cloudServiceTablePageLimit ?? DEFAULT_TABLE_PAGE_LIMIT,
        });
    },
    getters: {
        getCloudServiceTableHeight: (state): number => state.cloudServiceTableHeight,
        getCloudServiceTablePageLimit: (state): number => state.cloudServiceTablePageLimit,
    },
    actions: {
        setCloudServiceTableHeight(height: number) {
            this.cloudServiceTableHeight = height;
        },
        setCloudServiceTablePageLimit(limit: number) {
            this.cloudServiceTablePageLimit = limit;
        },
    },
});
