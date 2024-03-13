import { debouncedWatch } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';
import type { ComputedRef } from 'vue';

import type { SearchSchema } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { KeyItem, KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/types/inputs/search/query-search/type';

import {
    makeDistinctValueHandler, makeEnumValueHandler, makeReferenceValueHandler, makeCloudServiceTagValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

import { store } from '@/store';


import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import { pinia } from '@/store/pinia';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';


useAllReferenceStore(pinia);
const allReferenceStore = useAllReferenceStore();

const getKeyItemSets = (searchKeyGroups: SearchSchema, storeState): KeyItemSet[] => {
    const keyItemSets: KeyItemSet[] = [];
    searchKeyGroups.forEach((schema) => {
        const keyItems: KeyItem[] = [];
        schema.items.forEach((item) => {
            const keyItem: any = {
                label: item.name,
                name: item.key,
                dataType: item.data_type,
                reference: item.reference,
            };
            if (item.enums || item.reference) {
                keyItem.operators = ['=', '!='];
            }
            if (item.reference) {
                const splitReference = item.reference.split('.');
                const reference = splitReference[splitReference.length - 1];
                keyItem.valueSet = storeState[reference];
            }
            keyItems.push(keyItem);
        });
        const keyItemSet: KeyItemSet = {
            title: schema.title,
            items: keyItems,
        };
        keyItemSets.push(keyItemSet);
    });
    return keyItemSets;
};
const getValueHandlerMap = (searchKeyGroups: SearchSchema, resourceType: string, filters?: ApiFilter[], providers?: ProviderReferenceMap): ValueHandlerMap => {
    const valueHandlerMap: ValueHandlerMap = {};
    searchKeyGroups.forEach((schema) => {
        schema.items.forEach((item) => {
            if (item.enums) {
                valueHandlerMap[item.key] = makeEnumValueHandler(item.enums);
            } else if (item.reference) {
                valueHandlerMap[item.key] = makeReferenceValueHandler(item.reference, item.data_type);
            } else {
                const isCloudServiceResourceTags = resourceType === 'inventory.CloudService' && item.key === 'tags';
                if (isCloudServiceResourceTags) {
                    valueHandlerMap[item.key] = makeCloudServiceTagValueHandler(resourceType, item.key, item.data_type, filters, undefined, providers);
                } else valueHandlerMap[item.key] = makeDistinctValueHandler(resourceType, item.key, item.data_type, filters);
            }
        });
    });
    return valueHandlerMap;
};

/**
 * @name useQuerySearchPropsWithSearchSchema
 * @description A hook that returns props(keyItemSets, valueHandlerMap) necessary for DynamicLayoutQuerySearch component using search schema.
 *              Loading all reference store values inside the hook.
 * @param searchSchema
 * @param resourceType
 * @param filters
 */
export function useQuerySearchPropsWithSearchSchema(
    searchSchema: ComputedRef<SearchSchema>,
    resourceType: string,
    filters?: ComputedRef<ApiFilter[]>,
): { keyItemSets: ComputedRef<KeyItemSet[]>, valueHandlerMap: ComputedRef<ValueHandlerMap>, isAllLoaded: ComputedRef<boolean> } {
    (async () => {
        await store.dispatch('reference/loadAll');
    })();
    const storeState = reactive({
        Project: computed(() => allReferenceStore.getters.project),
        ProjectGroup: computed(() => allReferenceStore.getters.projectGroup),
        ServiceAccount: computed(() => store.getters['reference/serviceAccountItems']),
        CloudServiceType: computed(() => store.getters['reference/cloudServiceTypeItems']),
        Secret: computed(() => allReferenceStore.getters.secret),
        Collector: computed(() => store.getters['reference/collectorItems']),
        Provider: computed(() => store.getters['reference/providerItems']),
        Region: computed(() => store.getters['reference/regionItems']),
        Plugin: computed(() => store.getters['reference/pluginItems']),
        User: computed(() => allReferenceStore.getters.user),
        Protocol: computed(() => store.getters['reference/protocolItems']),
        Webhook: computed(() => allReferenceStore.getters.webhook),
    });

    const state = reactive({
        keyItemSets: [] as KeyItemSet[],
        valueHandlerMap: {} as ValueHandlerMap,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    debouncedWatch([() => searchSchema.value, () => store.state.reference.isAllLoaded], (watchValue) => {
        if (!watchValue) return;
        const [schema, isAllLoaded] = watchValue;
        if (isAllLoaded && schema.length) {
            state.keyItemSets = getKeyItemSets(schema, storeState);
            state.valueHandlerMap = getValueHandlerMap(searchSchema.value, resourceType, filters?.value, storeState.Provider);
        }
    }, { immediate: true, debounce: 200 });

    return {
        isAllLoaded: computed(() => store.state.reference.isAllLoaded),
        keyItemSets: computed(() => state.keyItemSets),
        valueHandlerMap: computed(() => state.valueHandlerMap),
    };
}
