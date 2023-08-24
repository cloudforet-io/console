<template>
    <div class="cost-explorer-filter-tags">
        <template v-if="!tagItems.length">
            <slot name="no-filter">
                <p-empty>
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_FILTERS') }}
                </p-empty>
            </slot>
        </template>
        <template v-else>
            <p-tag v-for="(item, idx) in tagItems"
                   :key="`selected-tag-${idx}-${item.value}`"
                   :deletable="deletable"
                   :category-item="hideCategory ? undefined : item.categoryItem"
                   :key-item="item.keyItem"
                   :value-item="item.valueItem"
                   @delete="handleDeleteFilterTag(item)"
            />
        </template>
    </div>
</template>
<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import {
    PEmpty, PTag,
} from '@spaceone/design-system';
import type { CategoryItem, KeyItem, ValueItem } from '@spaceone/design-system/types/inputs/search/query-search/type';
import { cloneDeep } from 'lodash';

import { store } from '@/store';

import type { ReferenceMap } from '@/store/modules/reference/type';

import { FILTER, FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import type { CostFiltersMap } from '@/services/cost-explorer/type';

interface Props {
    filters: CostFiltersMap;
    deletable: boolean;
}

interface TagItem {
    categoryItem: CategoryItem;
    keyItem?: KeyItem;
    valueItem: ValueItem
}

export default defineComponent<Props>({
    name: 'CostExplorerFilterTags',
    components: {
        PEmpty,
        PTag,
    },
    props: {
        filters: {
            type: Object,
            default: () => ({}),
        },
        hideCategory: {
            type: Boolean,
            default: false,
        },
        deletable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            resourceMap: computed(() => ({
                project_id: store.getters['reference/projectItems'],
                project_group_id: store.getters['reference/projectGroupItems'],
                service_account_id: store.getters['reference/serviceAccountItems'],
                provider: store.getters['reference/providerItems'],
                region_code: store.getters['reference/regionItems'],
            })),
            tagItems: computed<TagItem[]>(() => getRefinedTagItems(state.resourceMap, props.filters)),
        });

        /* Util */
        const getRefinedTagItems = (resourceMap: Record<string, ReferenceMap>, filters: CostFiltersMap): TagItem[] => {
            const results: TagItem[] = [];
            Object.entries(filters).forEach(([category, filterItems]) => {
                const resourceItems = resourceMap[category];
                filterItems.forEach((item) => {
                    let valueLabel = item.v;
                    const resourceItem = resourceItems?.[item.v];
                    if (resourceItem) {
                        valueLabel = (category === FILTER.REGION ? resourceItem.name : resourceItem.label) ?? item.v;
                    }
                    let keyItem: KeyItem | undefined;
                    if (category !== item.k) {
                        const convertedTagKey = item.k.replace(`${category}.`, '');
                        keyItem = { name: convertedTagKey, label: convertedTagKey };
                    }
                    results.push({
                        categoryItem: { name: category, label: FILTER_ITEM_MAP[category].label },
                        keyItem,
                        valueItem: { name: item.v, label: valueLabel },
                    });
                });
            });
            return results;
        };

        /* Event */
        const handleDeleteFilterTag = (item: TagItem) => {
            const _filters: CostFiltersMap = cloneDeep(props.filters);
            const targetCategory = item.categoryItem.name;
            const targetKey = item.keyItem?.name;
            const targetValue = item.valueItem.name;
            const targetFilterItems = _filters[targetCategory];
            const targetIndex = targetFilterItems.findIndex((f) => {
                if (targetKey) {
                    return f.k === `${targetCategory}.${targetKey}` && f.v === targetValue;
                }
                return f.v === targetValue;
            });
            targetFilterItems.splice(targetIndex, 1);
            emit('update-filter-tags', _filters);
        };

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/serviceAccount/load'),
                store.dispatch('reference/provider/load'),
                store.dispatch('reference/region/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            handleDeleteFilterTag,
        };
    },
});
</script>
<style lang="postcss" scoped>
.cost-explorer-filter-tags {
    height: 100%;
    overflow-y: auto;
    .p-tag {
        margin-bottom: 0.5rem;
    }
}
</style>
