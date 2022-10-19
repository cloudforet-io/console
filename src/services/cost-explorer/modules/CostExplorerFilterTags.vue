<template>
    <div class="cost-explorer-filter-tags" :class="{'print-mode': printMode}">
        <template v-if="!tagItems.length">
            <slot name="no-filter">
                <p-empty>
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_FILTERS') }}
                </p-empty>
            </slot>
        </template>
        <template v-else>
            <p-tag v-for="(item, idx) in tagItems" :key="`selected-tag-${idx}-${item.value}`"
                   :deletable="!printMode && deletable"
                   :category-item="item.categoryItem"
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
import type { CategoryItem, KeyItem, ValueItem } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { cloneDeep } from 'lodash';

import { store } from '@/store';

import { getRefinedTagItems } from '@/services/cost-explorer/cost-analysis/lib/helper';
import type { CostFiltersMap } from '@/services/cost-explorer/type';


interface Props {
    printMode: boolean;
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
        printMode: {
            type: Boolean,
            default: false,
        },
        filters: {
            type: Object,
            default: () => ({}),
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
    &.print-mode {
        .p-empty {
            @apply flex justify-start;
        }
    }
}
</style>
