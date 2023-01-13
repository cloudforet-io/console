<template>
    <p-text-input :placeholder="$t('COMMON.CUSTOM_FIELD_MODAL.SEARCH_TAG')"
                  :handler="handler"
                  :selected="selected"
                  multi-input
                  use-auto-complete
                  use-fixed-menu-style
                  appearance-type="stack"
                  block
                  @update:selected="handleUpdateSelected"
    />
</template>

<script setup lang="ts">
import {
    computed, ref, watch,
} from 'vue';

import {
    PTextInput,
} from '@spaceone/design-system';
import type { TextInputHandler, InputItem } from '@spaceone/design-system/types/inputs/input/text-input/type';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { TAGS_PREFIX } from '@/common/modules/custom-table/custom-field-modal/config';

const props = withDefaults(defineProps<{
    resourceType?: string;
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
    resourceType: '',
});
const emit = defineEmits<{(e: 'update:selected-tag-keys', tagKeys: string[]): void}>();

/* handler */
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
const handler: TextInputHandler = async (search) => {
    try {
        const { results } = await SpaceConnector.client.addOns.autocomplete.distinct({
            search,
            resource_type: props.resourceType,
            distinct_key: 'tags',
            options: {
                search_type: 'key',
                filter: filters.value,
                limit: 10,
            },
        });

        return {
            results: results.map((data) => ({ label: data.name, name: `${TAGS_PREFIX}${data.key}` })),
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
        };
    }
};

/* converters: string[] <-> InputItem[] */
const getInputItemsFromTagKeys = (keys: string[]): InputItem[] => keys.map((key) => {
    if (key.startsWith(TAGS_PREFIX)) {
        return { label: key.slice(TAGS_PREFIX.length), name: key };
    }
    return { label: key, name: `${TAGS_PREFIX}${key}` };
});
const getTagKeysFromInputItems = (items: InputItem[]): string[] => items.map((item) => {
    const key = item.name;
    if (key.startsWith(TAGS_PREFIX)) {
        return key;
    }
    return `${TAGS_PREFIX}${key}`;
});

/* selection */
const selected = ref<InputItem[]>(getInputItemsFromTagKeys(props.selectedTagKeys));
const handleUpdateSelected = (items: InputItem[]) => {
    selected.value = items;
    const tagKeys = getTagKeysFromInputItems(items);
    emit('update:selected-tag-keys', tagKeys);
};
watch(() => props.selectedTagKeys, (tagKeys) => {
    const currentKeys = getTagKeysFromInputItems(selected.value);
    if (JSON.stringify(currentKeys) !== JSON.stringify(tagKeys)) {
        const items = getInputItemsFromTagKeys(tagKeys);
        selected.value = items;
    }
});

</script>
