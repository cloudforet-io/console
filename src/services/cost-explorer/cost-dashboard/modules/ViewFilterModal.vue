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
            <div v-for="filterName in DASHBOARD_FILTER_NAMES" :key="`filter-wrapper-${filterName}`" class="filter-wrapper">
                <p class="title">
                    {{ FILTER_ITEM_MAP[filterName].label }} ({{ count[filterName] }})
                </p>
                <p-empty v-if="!count[filterName]">
                    {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.MODAL.NO_SELECGTED_FILTER') }}
                </p-empty>
                <div v-else class="filters">
                    <p-tag v-for="(item, idx) in filterItemsMap[filterName]" :key="`filter-${item.name}-${idx}`"
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

import { FILTER, FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { CostQueryFilterItemsMap, CostQueryFilters } from '@/services/cost-explorer/type';
import { store } from '@/store';
import { ReferenceItem } from '@/store/modules/reference/type';


const DASHBOARD_FILTER_NAMES = [FILTER.PROJECT_GROUP, FILTER.PROJECT, FILTER.SERVICE_ACCOUNT, FILTER.PROVIDER];

interface Props {
    visible: boolean;
    selectedFilters: CostQueryFilters;
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
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            count: computed(() => ({
                [FILTER.PROJECT_GROUP]: props.selectedFilters[FILTER.PROJECT_GROUP]?.length || 0,
                [FILTER.PROJECT]: props.selectedFilters[FILTER.PROJECT]?.length || 0,
                [FILTER.SERVICE_ACCOUNT]: props.selectedFilters[FILTER.SERVICE_ACCOUNT]?.length || 0,
                [FILTER.PROVIDER]: props.selectedFilters[FILTER.PROVIDER]?.length || 0,
            })),
            filterItemsMap: computed(() => {
                const itemsMap: CostQueryFilterItemsMap = {};
                const resourceItemsMap = {
                    project_id: store.state.reference.project.items,
                    project_group_id: store.state.reference.projectGroup.items,
                    service_account_id: store.state.reference.serviceAccount.items,
                    provider: store.state.reference.provider.items,
                };

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
            ]);
        })();

        return {
            ...toRefs(state),
            FILTER,
            FILTER_ITEM_MAP,
            DASHBOARD_FILTER_NAMES,
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
