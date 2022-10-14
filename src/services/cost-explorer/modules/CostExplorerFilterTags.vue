<template>
    <div class="cost-explorer-filter-tags" :class="{'print-mode': printMode}">
        <template v-if="!filterItems.length">
            <slot name="no-filter">
                <p-empty>
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_FILTERS') }}
                </p-empty>
            </slot>
        </template>
        <template v-else>
            <p-tag v-for="(refinedItem, idx) in refinedFilterItems" :key="`selected-tag-${idx}-${refinedItem.value}`"
                   :deletable="!printMode"
                   :category-item="categoryItemFormatter(refinedItem)"
                   :key-item="keyItemFormatter(refinedItem)"
                   :value-item="valueItemFormatter(refinedItem)"
                   @delete="handleDeleteFilterTag(refinedItem)"
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

import { store } from '@/store';

import { getRefinedFilterItems } from '@/services/cost-explorer/cost-analysis/lib/helper';
import { FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import type { CostQueryFilterItem, RefinedFilterItem } from '@/services/cost-explorer/type';


interface Props {
    printMode: boolean;
    filterItems: CostQueryFilterItem[];
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
        filterItems: {
            type: Array,
            default: () => ([]),
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
            refinedFilterItems: computed<RefinedFilterItem[]>(() => getRefinedFilterItems(state.resourceMap, props.filterItems)),
        });

        /* Util */
        const categoryItemFormatter = (refinedItem: RefinedFilterItem) => ({
            name: FILTER_ITEM_MAP[refinedItem.category].label,
        });
        const keyItemFormatter = (refinedItem: RefinedFilterItem) => {
            if (!refinedItem.key) return undefined;
            return { name: refinedItem.key };
        };
        const valueItemFormatter = (refinedItem: RefinedFilterItem) => ({
            name: refinedItem.label,
        });

        /* Event */
        const handleDeleteFilterTag = (item: RefinedFilterItem) => {
            const _filters: CostQueryFilterItem[] = [...props.filterItems];
            const _index = _filters.findIndex((f) => {
                if (f.category !== item.category) return false;
                if (item.key) {
                    return f.key === item.key && f.value === item.value;
                }
                return f.value === item.value;
            });
            _filters.splice(_index, 1);
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
            categoryItemFormatter,
            keyItemFormatter,
            valueItemFormatter,
            handleDeleteFilterTag,
        };
    },
});
</script>
<style lang="postcss" scoped>
.cost-explorer-filter-tags {
    height: 100%;
    overflow-y: auto;
    padding: 0.75rem 1rem;
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
