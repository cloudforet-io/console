import { computed } from 'vue';

import { useGlobalConfigSchemaStore } from '@/store/global-config-schema/global-config-schema-store';

import type { FeatureKeyType } from '@/lib/config/global-config/types/type';

export const useUiAffectsSchema = (featureKey: FeatureKeyType) => {
    const globalConfigSchemaStore = useGlobalConfigSchemaStore();

    return computed(() => globalConfigSchemaStore.state.uiAffectsSchema[featureKey]);
};
