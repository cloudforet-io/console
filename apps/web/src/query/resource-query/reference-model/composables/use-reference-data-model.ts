
import {
    ref,
} from 'vue';

import { referenceQueryClient as queryClient } from '@/query/clients';
import { useReferenceQueryKey } from '@/query/core/query-key/use-reference-query-key';
import { useReferenceReactiveCache } from '@/query/resource-query/reference-model/composables/_internal/use-reference-reactive-cache';
import { getRepository } from '@/query/resource-query/reference-model/core/repository-registry';
import type { ReferenceItem, ReferenceDataModelFetchConfig } from '@/query/resource-query/reference-model/types/reference-type';
import { createEventEmitter } from '@/query/resource-query/reference-model/utils/create-event-emitter';
import { makeReferenceProxy } from '@/query/resource-query/reference-model/utils/reference-proxy-helper';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';


const ID_REQUEST_BUS_KEY = Symbol('IDRequestBus');

export const useReferenceDataModel = <T extends Record<string, any>, R extends ReferenceItem>(
    resourceKey: ResourceKeyType,
    referenceAdaptor: (arg: T) => ReferenceItem,
    fetchConfig: ReferenceDataModelFetchConfig<T>,
) => {
    const { key: queryKey } = useReferenceQueryKey(resourceKey);
    const idRequestBus = createEventEmitter();

    const referenceRepository = getRepository(
        resourceKey,
        queryClient,
        queryKey.value,
        fetchConfig.listFetcher,
        fetchConfig.query,
    );


    idRequestBus.on(ID_REQUEST_BUS_KEY, (id) => {
        referenceRepository.requestItem(id);
    });

    const { referenceMapRefs } = useReferenceReactiveCache(queryKey, referenceAdaptor);
    const referenceMap = makeReferenceProxy<Record<string, R|undefined>>({}, (_, id: string) => {
        if (!(id in referenceMapRefs)) {
            referenceMapRefs[id] = ref(undefined);
            idRequestBus.emit(ID_REQUEST_BUS_KEY, id);
        }
        return referenceMapRefs[id].value;
    });

    return {
        referenceMap,
    };
};


// TODO: add referenceModel DX guidelines
