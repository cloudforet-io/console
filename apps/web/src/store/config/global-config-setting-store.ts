import { reactive } from 'vue';

import { defineStore } from 'pinia';

interface GlobalConfigSettingState {
    featureVersions: FeatureVersions,
}

export interface FeatureVersions {
    DASHBOARD: string;
    PROJECT: string;
    SERVICE_ACCOUNT: string;
    ASSET_INVENTORY: string;
    COST_EXPLORER: string;
    ALERT_MANAGER: string;
    OPS_FLOW: string;
    IAM: string;
}

export const useGlobalConfigSettingStore = defineStore('global-config-setting-store', () => {
    const state = reactive<GlobalConfigSettingState>({
        featureVersions: {
            DASHBOARD: 'V1',
            PROJECT: 'V1',
            SERVICE_ACCOUNT: 'V1',
            ASSET_INVENTORY: 'V1',
            COST_EXPLORER: 'V1',
            ALERT_MANAGER: 'V1',
            OPS_FLOW: 'V1',
            IAM: 'V1',
        },
    });

    const mutations = {
        setFeatureVersion(featureVersions: FeatureVersions) {
            state.featureVersions = featureVersions;
        },
    };

    return {
        state,
        ...mutations,
    };
});
