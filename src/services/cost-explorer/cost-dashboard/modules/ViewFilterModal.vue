<template>
    <p-button-modal
        class="view-filter-modal"
        :header-title="$t('BILLING.COST_MANAGEMENT.MAIN.APPLIED_FILTER')"
        size="md"
        fade
        backdrop
        :visible.sync="proxyVisible"
        @confirm="handleClickConfirm"
    >
        <template #body>
            <div v-for="filterName in filterNames" :key="`filter-wrapper-${filterName}`" class="filter-wrapper">
                <p class="title">
                    {{ FILTER_ITEM_MAP[filterName].label }} ({{ items[filterName] ? items[filterName].length : 0 }})
                </p>
                <p-empty v-if="!items[filterName] || !items[filterName].length">
                    {{ $t('BILLING.COST_MANAGEMENT.MAIN.NO_SELECTED_FILTER') }}
                </p-empty>
                <div v-else class="filters">
                    <p-tag v-for="(item, idx) in items[filterName]" :key="`filter-${item.name}-${idx}`"
                           :deletable="false"
                    >
                        {{ item.label }}
                    </p-tag>
                </div>
            </div>
        </template>
        <template #confirm-button>
            {{ $t('BILLING.COST_MANAGEMENT.MAIN.CLOSE') }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PButtonModal, PEmpty, PTag,
} from '@spaceone/design-system';

import { store } from '@/store';

import { ReferenceItem } from '@/store/modules/reference/type';

import { useProxyValue } from '@/common/composables/proxy-state';

import { FILTER, FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { CostQueryFilterItemsMap, CostQueryFilters } from '@/services/cost-explorer/type';


const DASHBOARD_FILTERS = [FILTER.PROJECT_GROUP, FILTER.PROJECT, FILTER.SERVICE_ACCOUNT, FILTER.PROVIDER];
const CUSTOM_DASHBOARD_FILTERS = Object.values(FILTER);

interface Props {
    visible: boolean;
    selectedFilters: CostQueryFilters;
    isCustom?: boolean;
}

export default {
    name: 'ViewFilterModal',
    components: {
        PButtonModal,
        PEmpty,
        PTag,
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
            filterNames: computed(() => (props.isCustom ? CUSTOM_DASHBOARD_FILTERS : DASHBOARD_FILTERS)),
            items: computed(() => {
                const resourceItemsMap = {
                    [FILTER.PROJECT_GROUP]: store.state.reference.projectGroup.items,
                    [FILTER.PROJECT]: store.state.reference.project.items,
                    [FILTER.PROVIDER]: store.state.reference.provider.items,
                    [FILTER.SERVICE_ACCOUNT]: store.state.reference.serviceAccount.items,
                    [FILTER.REGION]: store.state.reference.region.items,
                };
                const itemsMap: CostQueryFilterItemsMap = {};
                Object.entries(props.selectedFilters as CostQueryFilters).forEach(([key, data]) => {
                    const resourceItems = resourceItemsMap[key];
                    if (resourceItems) {
                        itemsMap[key] = data?.map((d) => {
                            const resourceItem: ReferenceItem = resourceItems[d];
                            return { name: d, label: resourceItem?.label ?? d };
                        });
                    } else itemsMap[key] = data?.map(d => ({ name: d, label: d }));
                });
                return itemsMap;
            }),
        });

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
        };
    },
};
</script>

<style lang="postcss" scoped>
.view-filter-modal::v-deep {
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
    .modal-body {
        max-height: 20rem;
    }
    .modal-footer {
        .cancel-button {
            display: none;
        }
        .modal-button {
            margin-left: auto;
        }
    }
}
</style>
