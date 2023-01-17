import { computed, reactive } from 'vue';

import { store } from '@/store';

import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';

export const useReferenceStore = () => {
    const referenceStoreState = reactive({
        loading: true,
        provider: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
        project_id: computed(() => store.getters['reference/projectItems']),
        service_account_id: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
        user_id: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
        cloud_service_type_id: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
        region_code: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
    });
    (async () => {
        referenceStoreState.loading = true;
        await Promise.allSettled([
            store.dispatch('reference/provider/load'),
            store.dispatch('reference/project/load'),
            store.dispatch('reference/serviceAccount/load'),
            store.dispatch('reference/cloudServiceType/load'),
            store.dispatch('reference/region/load'),
            store.dispatch('reference/user/load'),
        ]);
        referenceStoreState.loading = false;
    })();

    return {
        referenceStoreState,
    };
};
