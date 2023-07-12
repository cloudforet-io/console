import {
    makeDistinctValueHandler, makeEnumValueHandler, makeReferenceValueHandler, makeCloudServiceTagValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItem, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';
import { debouncedWatch } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';
import type { ComputedRef } from 'vue';

import { store } from '@/store';


import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import type { ConsoleSearchSchema } from '@/lib/component-util/dynamic-layout/type';

const getKeyItemSets = (schemaList: ConsoleSearchSchema[], storeState): KeyItemSet[] => {
    const keyItemSets: KeyItemSet[] = [];
    schemaList.forEach((schema) => {
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
const getValueHandlerMap = (schemaList: ConsoleSearchSchema[], resourceType: string, filters?: ApiFilter[], providers?: ProviderReferenceMap): ValueHandlerMap => {
    const valueHandlerMap: ValueHandlerMap = {};
    schemaList.forEach((schema) => {
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
    searchSchema: ComputedRef<ConsoleSearchSchema[]>,
    resourceType: string,
    filters?: ComputedRef<ApiFilter[]>,
): { keyItemSets: ComputedRef<KeyItemSet[]>, valueHandlerMap: ComputedRef<ValueHandlerMap>, isAllLoaded: ComputedRef<boolean> } {
    (async () => {
        await store.dispatch('reference/loadAll');
    })();
    const storeState = reactive({
        Project: computed(() => store.getters['reference/projectItems']),
        ProjectGroup: computed(() => store.getters['reference/projectGroupItems']),
        ServiceAccount: computed(() => store.getters['reference/serviceAccountItems']),
        CloudServiceType: computed(() => store.getters['reference/cloudServiceTypeItems']),
        Secret: computed(() => store.getters['reference/secretItems']),
        Collector: computed(() => store.getters['reference/collectorItems']),
        Provider: computed(() => store.getters['reference/providerItems']),
        Region: computed(() => store.getters['reference/regionItems']),
        Plugin: computed(() => store.getters['reference/pluginItems']),
        User: computed(() => store.getters['reference/userItems']),
        Protocol: computed(() => store.getters['reference/protocolItems']),
        Webhook: computed(() => store.getters['reference/webhookItems']),
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
        isAllLoaded: computed(() => store.state['reference/isAllLoaded']),
        keyItemSets: computed(() => state.keyItemSets),
        valueHandlerMap: computed(() => state.valueHandlerMap),
    };
}
