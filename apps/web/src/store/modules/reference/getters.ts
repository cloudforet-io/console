import type { Getter } from 'vuex';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { VuexStoreAllReferenceTypeInfo } from '@/store/modules/reference/type';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

export const providerItems: Getter<any, any> = (state): ProviderReferenceMap => state.provider?.items ?? {};

export const allReferenceTypeInfo: Getter<any, any> = (state, getters): VuexStoreAllReferenceTypeInfo => ({
    protocol: {
        ...REFERENCE_TYPE_INFO.protocol,
        referenceMap: getters.protocolItems,
    },
    //
    provider: {
        ...REFERENCE_TYPE_INFO.provider,
        referenceMap: getters.providerItems,
    },
});
