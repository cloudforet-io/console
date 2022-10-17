<template>
    <p-button-modal
        class="view-filter-modal"
        :header-title="$t('BILLING.COST_MANAGEMENT.MAIN.APPLIED_FILTER')"
        fade
        backdrop
        hide-footer-confirm-button
        :visible.sync="proxyVisible"
    >
        <template #body>
            <div v-for="filterName in filterNames" :key="`filter-wrapper-${filterName}`" class="filter-wrapper">
                <p class="title">
                    {{ FILTER_ITEM_MAP[filterName].label }} ({{ refinedItemsByCategory(filterName).length }})
                </p>
                <cost-explorer-filter-tags :filter-items="refinedItemsByCategory(filterName)">
                    <template #no-filter>
                        <p-empty>{{ $t('BILLING.COST_MANAGEMENT.MAIN.NO_SELECTED_FILTER') }}</p-empty>
                    </template>
                </cost-explorer-filter-tags>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import {
    PButtonModal, PEmpty,
} from '@spaceone/design-system';

import { store } from '@/store';

import { useProxyValue } from '@/common/composables/proxy-state';

import { getRefinedFilterItems } from '@/services/cost-explorer/cost-analysis/lib/helper';
import { FILTER, FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import CostExplorerFilterTags from '@/services/cost-explorer/modules/CostExplorerFilterTags.vue';
import type { CostQueryFilterItem, RefinedFilterItem } from '@/services/cost-explorer/type';


const DASHBOARD_FILTERS = [FILTER.PROJECT_GROUP, FILTER.PROJECT, FILTER.SERVICE_ACCOUNT, FILTER.PROVIDER];
const CUSTOM_DASHBOARD_FILTERS = Object.values(FILTER);

interface Props {
    visible: boolean;
    selectedFilters: CostQueryFilterItem[];
    isCustom?: boolean;
}

export default {
    name: 'ViewFilterModal',
    components: {
        CostExplorerFilterTags,
        PButtonModal,
        PEmpty,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        selectedFilters: {
            type: Array,
            default: () => ([]),
        },
        isCustom: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            filterNames: computed(() => (props.isCustom ? CUSTOM_DASHBOARD_FILTERS : DASHBOARD_FILTERS)),
            resourceMap: computed(() => ({
                project_id: store.getters['reference/projectItems'],
                project_group_id: store.getters['reference/projectGroupItems'],
                service_account_id: store.getters['reference/serviceAccountItems'],
                provider: store.getters['reference/providerItems'],
                region_code: store.getters['reference/regionItems'],
            })),
            refinedItems: computed<RefinedFilterItem[]>(() => getRefinedFilterItems(state.resourceMap, props.selectedFilters)),
        });

        /* Util */
        const refinedItemsByCategory = (category: string) => state.refinedItems.filter(d => d.category === category);

        /* event */
        const handleClickConfirm = () => {
            state.proxyVisible = false;
        };

        // LOAD REFERENCE STORE
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
            FILTER,
            FILTER_ITEM_MAP,
            handleClickConfirm,
            refinedItemsByCategory,
        };
    },
};
</script>

<style lang="postcss" scoped>
/* custom design-system component - p-button-modal */
.view-filter-modal {
    :deep(.modal-body) {
        max-height: 20rem;
    }
}

.filter-wrapper {
    margin-bottom: 1.5rem;
    .title {
        margin-bottom: 1rem;
    }
    .p-empty {
        @apply justify-start ;
        font-size: 0.875rem;
    }
    .filters {
        @apply flex flex-wrap;
        gap: 0.5rem;
    }
}
</style>
