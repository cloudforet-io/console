import type { Getter } from 'vuex';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import type { ProtocolReferenceMap } from '@/store/modules/reference/protocol/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { VuexStoreAllReferenceTypeInfo } from '@/store/modules/reference/type';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

export const protocolItems: Getter<any, any> = (state): ProtocolReferenceMap => state.protocol?.items ?? {};

export const pluginItems: Getter<any, any> = (state): PluginReferenceMap => state.plugin?.items ?? {};

export const providerItems: Getter<any, any> = (state): ProviderReferenceMap => state.provider?.items ?? {};

export const allReferenceTypeInfo: Getter<any, any> = (state, getters): VuexStoreAllReferenceTypeInfo => ({
    protocol: {
        ...REFERENCE_TYPE_INFO.protocol,
        referenceMap: getters.protocolItems,
    },
    //
    plugin: {
        ...REFERENCE_TYPE_INFO.plugin,
        referenceMap: getters.pluginItems,
    },
    //
    provider: {
        ...REFERENCE_TYPE_INFO.provider,
        referenceMap: getters.providerItems,
    },
});
