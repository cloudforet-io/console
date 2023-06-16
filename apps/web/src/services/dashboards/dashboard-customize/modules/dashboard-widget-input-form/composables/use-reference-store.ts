import { computed, reactive } from 'vue';
import { useStore } from 'vuex';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

export const useReferenceStore = () => {
    const store = useStore();
    const referenceStoreState = reactive({
        loading: true,
        provider: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
        project: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
        project_group: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
        service_account: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
        region: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
    });
    (async () => {
        referenceStoreState.loading = true;
        await Promise.allSettled([
            store.dispatch('reference/provider/load'),
            store.dispatch('reference/project/load'),
            store.dispatch('reference/projectGroup/load'),
            store.dispatch('reference/serviceAccount/load'),
            store.dispatch('reference/region/load'),
        ]);
        referenceStoreState.loading = false;
    })();

    return {
        referenceStoreState,
    };
};
