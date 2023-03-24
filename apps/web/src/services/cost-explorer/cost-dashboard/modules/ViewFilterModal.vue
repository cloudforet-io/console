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
            <div v-for="category in categories"
                 :key="`filter-wrapper-${category}`"
                 class="filter-wrapper"
            >
                <p class="title">
                    {{ FILTER_ITEM_MAP[category].label }} ({{ selectedFilters[category] ? selectedFilters[category].length : 0 }})
                </p>
                <cost-explorer-filter-tags :filters="{ [category]: selectedFilters[category] ? selectedFilters[category] : [] }"
                                           hide-category
                >
                    <template #no-filter>
                        <p-empty>
                            {{ $t('BILLING.COST_MANAGEMENT.MAIN.NO_SELECTED_FILTER') }}
                        </p-empty>
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

import { FILTER, FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import CostExplorerFilterTags from '@/services/cost-explorer/modules/CostExplorerFilterTags.vue';
import type { CostFiltersMap } from '@/services/cost-explorer/type';

const DASHBOARD_FILTERS = [FILTER.PROJECT_GROUP, FILTER.PROJECT, FILTER.SERVICE_ACCOUNT, FILTER.PROVIDER];
const CUSTOM_DASHBOARD_FILTERS = Object.values(FILTER);

interface Props {
    visible: boolean;
    selectedFilters: CostFiltersMap;
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
            type: Object,
            default: () => ({}),
        },
        isCustom: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            categories: computed(() => (props.isCustom ? CUSTOM_DASHBOARD_FILTERS : DASHBOARD_FILTERS)),
        });

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
