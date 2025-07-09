import { computed } from 'vue';

import { useGlobalConfigSchemaStore } from '@/store/global-config-schema/global-config-schema-store';

import { SERVICE_FEATURES } from '@/lib/config/global-config/constants/constants';
import type { FeatureKeyType } from '@/lib/config/global-config/types/type';


export const useGlobalConfigUiAffectsSchema = (featureKey: FeatureKeyType) => {
    if (!Object.values(SERVICE_FEATURES).includes(featureKey)) {
        throw new Error(`Invalid feature key: ${featureKey}`);
    }

    const globalConfigSchemaStore = useGlobalConfigSchemaStore();

    return computed(() => globalConfigSchemaStore.state.uiAffectsSchema[featureKey]);
};
