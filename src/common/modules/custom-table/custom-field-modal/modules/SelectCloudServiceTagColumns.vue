<template>
    <p-query-input :placeholder="$t('COMMON.CUSTOM_FIELD_MODAL.SEARCH_TAG')"
                   use-fixed-menu-style
                   block
                   :selected="selected"
                   multi-input
                   appearance-type="stack"
                   :key-item-sets="keyItemSets"
                   :value-handler-map="valueHandlerMap"
                   @update:selected="handleUpdateSelected"
    />
</template>

<script setup lang="ts">
import {
    computed,
    ref, watch,
} from 'vue';

import {
    PQueryInput,
} from '@spaceone/design-system';
import type {
    QueryItem, ValueHandlerMap, ValueHandler, KeyItemSet,
} from '@spaceone/design-system/types/inputs/search/query-search/type';
import { isEqual } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

import { store } from '@/store';

import type { ProviderReferenceItem, ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { TAGS_PREFIX } from '@/common/modules/custom-table/custom-field-modal/config';

const props = withDefaults(defineProps<{
    selectedTagKeys?: string[];
    options?: {
        provider?: string;
        cloudServiceGroup?: string;
        cloudServiceType?: string;
    };
    isServerPage?: boolean;
}>(), {
    selectedTagKeys: () => [],
    options: () => ({}),
    isServerPage: false,
});

const emit = defineEmits<{(e: 'update:selected-tag-keys', tagKeys: string[]): void}>();

/* providers */
const providersMap = computed<ProviderReferenceMap>(() => ({
    ...store.getters['reference/providerItems'],
    custom: {
        label: 'Custom',
        key: 'custom',
        icon: 'ic_provider_other',
    },
}));
const providers = computed<ProviderReferenceItem[]>(() => Object.values(providersMap.value));
store.dispatch('reference/provider/load');
const providerKeys = computed<string[]>(() => providers.value.map((provider) => provider.key));

/* key items */
const keyItemSets = computed<KeyItemSet[]>(() => [{
    title: 'Provider',
    items: [
        ...providers.value.map((provider) => ({
            label: provider.label,
            name: provider.key,
            imageUrl: provider.key !== 'custom' ? provider.icon : undefined,
            icon: provider.key === 'custom' ? provider.icon : undefined,
        })),
    ],
}]);

/* value handler */
const valueHandlerMap = computed<ValueHandlerMap>(() => {
    const result = { custom: getTags };
    providers.value.forEach((provider) => {
        result[provider.key] = getTags;
    });
    return result;
});
const tagsQueryHelper = new QueryHelper();
const filters = computed<ApiFilter[]>(() => {
    tagsQueryHelper.setFilters([]);
    const { provider, cloudServiceGroup, cloudServiceType } = props.options;
    if (provider) tagsQueryHelper.addFilter({ k: 'provider', v: provider, o: '=' });
    if (cloudServiceGroup) tagsQueryHelper.addFilter({ k: 'cloud_service_group', v: cloudServiceGroup, o: '=' });
    if (cloudServiceType) tagsQueryHelper.addFilter({ k: 'cloud_service_type', v: cloudServiceType, o: '=' });
    if (props.isServerPage) tagsQueryHelper.addFilter({ k: 'ref_cloud_service_type.labels', v: 'Server', o: '=' });
    return tagsQueryHelper.apiQuery.filter;
});
const getTags: ValueHandler = async (search, rootKey) => {
    try {
        console.debug('rootKey.name', rootKey.name, 'search', search);
        const { results } = await SpaceConnector.client.addOns.autocomplete.distinct({
            search,
            resource_type: 'inventory.CloudService',
            distinct_key: `tag_keys.${rootKey.name}`,
            options: {
                search_type: 'key',
                filter: filters.value,
                limit: 10,
            },
        });
        return {
            results: results.map((data) => ({ label: data.name, name: data.key })),
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
        };
    }
};

/* converters: string[] <-> QueryItem[] */
const getQueryItemsFromTagKeys = (tagKeys: string[]): QueryItem[] => tagKeys.map((tagKey) => {
    const query = tagKey.slice(TAGS_PREFIX.length);
    const dotPosition = query.indexOf('.');
    const key = query.slice(0, dotPosition);
    const value = query.slice(dotPosition + 1);
    return {
        key: {
            label: providersMap.value[key].label,
            name: key,
        },
        value: {
            label: value,
            name: value,
        },
    };
});
const getTagKeysFromQueryItems = (items: QueryItem[]): string[] => items.map((item) => {
    if (!item.key) {
        return `${TAGS_PREFIX}custom.${item.value.name}`;
    }
    if (providerKeys.value.includes(item.key.name)) {
        return `${TAGS_PREFIX}${item.key.name}.${item.value.name}`;
    }
    return `${TAGS_PREFIX}custom.${item.value.name}`;
});

/* selection */
const selected = ref<QueryItem[]>(getQueryItemsFromTagKeys(props.selectedTagKeys));
const handleUpdateSelected = (items: QueryItem[]) => {
    selected.value = items;
    const tagKeys = getTagKeysFromQueryItems(items);
    emit('update:selected-tag-keys', tagKeys);
};
watch(() => props.selectedTagKeys, (tagKeys) => {
    const items = getQueryItemsFromTagKeys(tagKeys);
    if (!isEqual(selected.value, items)) {
        selected.value = items;
    }
});

</script>

