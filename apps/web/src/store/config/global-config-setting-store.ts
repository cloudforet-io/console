import { reactive } from 'vue';

import { defineStore } from 'pinia';

interface GlobalConfigSettingState {
    featureVersions: Record<string, string>,
}

export const useGlobalConfigSettingStore = defineStore('global-config-setting-store', () => {
    const state = reactive<GlobalConfigSettingState>({
        featureVersions: {
            DASHBOARD: 'V1',
            PROJECT: 'V1',
            ASSET_INVENTORY: 'V1',
            COST_EXPLORER: 'V1',
            ALERT_MANAGER: 'V1',
            OPS_FLOW: 'V1',
            IAM: 'V1',
            INFO: 'V1',
        },
    });

    const mutations = {
        setFeatureVersion(featureVersions: Record<string, string>) {
            state.featureVersions = featureVersions;
        },
    };

    return {
        state,
        ...mutations,
    };
});
