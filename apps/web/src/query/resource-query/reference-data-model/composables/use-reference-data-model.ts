
import {
    ref,
} from 'vue';

import { referenceQueryClient as queryClient } from '@/query/clients';
import { useResourceQueryKey } from '@/query/core/query-key/use-resource-query-key';
import { useReferenceReactiveCache } from '@/query/resource-query/reference-data-model/composables/_internal/use-reference-reactive-cache';
import { getRepository } from '@/query/resource-query/reference-data-model/core/repository-registry';
import type { ReferenceItem, ReferenceDataModelFetchConfig } from '@/query/resource-query/reference-data-model/types/reference-type';
import { createEventEmitter } from '@/query/resource-query/reference-data-model/utils/create-event-emitter';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';
import { makeResourceProxy } from '@/query/resource-query/shared/utils/resource-proxy-helper';
import { subscriptionManager } from '@/query/shared/subscription-manager';


const ID_REQUEST_BUS_KEY = Symbol('IDRequestBus');

export const useReferenceDataModel = <T extends Record<string, any>, R extends ReferenceItem<Record<string, any>>>(
    resourceKey: ResourceKeyType,
    referenceAdaptor: (arg: T) => ReferenceItem,
    fetchConfig: ReferenceDataModelFetchConfig<T>,
) => {
    const { key: queryKey } = useResourceQueryKey(resourceKey);
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

    const { referenceMapRefs, unsubscribe } = useReferenceReactiveCache<T, R>(queryKey, referenceAdaptor);

    const referenceMap = makeResourceProxy<Record<string, R|undefined>>({}, (_, id: string) => {
        if (!(id in referenceMapRefs)) {
            referenceMapRefs[id] = ref(undefined);
            idRequestBus.emit(ID_REQUEST_BUS_KEY, id);
        }
        return referenceMapRefs[id].value;
    });

    subscriptionManager.register(referenceMap, unsubscribe);

    return {
        referenceMap,
    };
};


// TODO: add referenceModel DX guidelines
