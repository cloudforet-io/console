import { defineStore } from 'pinia';

import { initServiceSettingsStore } from '@/store/util';


interface AssetInventorySettingsStore {
    cloudServiceTableHeight: number;
    cloudServiceTablePageLimit: number;
    notShowMetricSelectGuidePopover?: boolean;
}

export const DEFAULT_TABLE_PAGE_LIMIT = 15;
export const TABLE_MIN_HEIGHT = 400;

export const useAssetInventorySettingsStore = defineStore('asset-inventory-settings', {
    state: (): AssetInventorySettingsStore => ({
        cloudServiceTableHeight: TABLE_MIN_HEIGHT,
        cloudServiceTablePageLimit: DEFAULT_TABLE_PAGE_LIMIT,
        notShowMetricSelectGuidePopover: false,
    }),
    getters: {
        getCloudServiceTableHeight: (state): number => state.cloudServiceTableHeight,
        getCloudServiceTablePageLimit: (state): number => state.cloudServiceTablePageLimit,
        getNotShowMetricSelectGuidePopover: (state): boolean => !!state.notShowMetricSelectGuidePopover,
    },
    actions: {
        setCloudServiceTableHeight(height: number) {
            this.cloudServiceTableHeight = height;
        },
        setCloudServiceTablePageLimit(limit: number) {
            this.cloudServiceTablePageLimit = limit;
        },
        setNotShowMetricSelectGuidePopover(noMore: boolean) {
            this.notShowMetricSelectGuidePopover = noMore;
        },
        initState(userId?: string) {
            const localStorageItem = initServiceSettingsStore<AssetInventorySettingsStore>('assetInventory', userId);
            this.cloudServiceTableHeight = localStorageItem?.cloudServiceTableHeight ?? TABLE_MIN_HEIGHT;
            this.cloudServiceTablePageLimit = localStorageItem?.cloudServiceTablePageLimit ?? DEFAULT_TABLE_PAGE_LIMIT;
            this.notShowMetricSelectGuidePopover = localStorageItem?.notShowMetricSelectGuidePopover ?? false;
        },
    },
});
