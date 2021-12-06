<template>
    <div class="set-filter-part">
        <p class="applied-filter">
            <span class="label">{{ $t('BILLING.COST_MANAGEMENT.MAIN.APPLIED_FILTER') }}:</span>
            {{ appliedFilterDescription }}
        </p>
        <p-button
            style-type="gray-border"
            size="sm"
            @click.stop="handleClickViewFilter"
        >
            {{ $t('BILLING.COST_MANAGEMENT.MAIN.VIEW_FILTER') }}
        </p-button>
        <div class="left-divider">
            <p-icon-button name="ic_setting" style-type="gray900" size="sm"
                           outline
                           @click="handleClickSelectFilter"
            />
        </div>
        <view-filter-modal :visible.sync="viewFilterModalVisible"
                           :selected-filters="proxyFilters"
        />
        <set-filter-modal :visible.sync="selectFilterModalVisible"
                          :filter-items="filterItems"
                          :selected-filters="proxyFilters"
                          @confirm="handleConfirmSetFilter"
        />
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import { PButton, PIconButton } from '@spaceone/design-system';
import ViewFilterModal from '@/services/billing/cost-management/cost-dashboard/modules/ViewFilterModal.vue';
import SetFilterModal from '@/services/billing/cost-management/modules/SetFilterModal.vue';

import { FILTER, FILTER_ITEM_MAP } from '@/services/billing/cost-management/lib/config';
import { CostQueryFilterItemsMap, CostQueryFilters } from '@/services/billing/cost-management/type';
import { ResourceItem } from '@/store/modules/resource/type';
import { makeProxy } from '@/lib/helper/composition-helpers';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { store } from '@/store';
import { i18n } from '@/translations';


interface Props {
    dashboardId: string;
    filters: CostQueryFilters;
}

export default {
    name: 'CostDashboardFilter',
    components: {
        ViewFilterModal,
        SetFilterModal,
        PButton,
        PIconButton,
    },
    props: {
        dashboardId: {
            type: String,
            default: '',
        },
        /* sync */
        filters: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit, root }) {
        const state = reactive({
            proxyFilters: makeProxy('filters', props, emit),
            filterItems: [
                { name: FILTER.PROJECT, title: FILTER_ITEM_MAP[FILTER.PROJECT].label },
                { name: FILTER.SERVICE_ACCOUNT, title: FILTER_ITEM_MAP[FILTER.SERVICE_ACCOUNT].label },
                { name: FILTER.PROVIDER, title: FILTER_ITEM_MAP[FILTER.PROVIDER].label },
            ],
            filterItemsMap: computed<CostQueryFilterItemsMap>(() => {
                const itemsMap: CostQueryFilterItemsMap = {};
                const resourceItemsMap = {
                    project_id: store.state.resource.project.items,
                    service_account_id: store.state.resource.serviceAccount.items,
                    provider: store.state.resource.provider.items,
                    region_code: store.state.resource.region.items,
                };

                Object.entries(state.proxyFilters as CostQueryFilters).forEach(([key, data]) => {
                    const resourceItems = resourceItemsMap[key];
                    if (resourceItems) {
                        itemsMap[key] = data?.map((d) => {
                            const resourceItem: ResourceItem = resourceItems[d];
                            return { name: d, label: resourceItem?.label ?? d };
                        });
                    } else itemsMap[key] = data?.map(d => ({ name: d, label: d }));
                });
                return itemsMap;
            }),
            viewFilterModalVisible: false,
            selectFilterModalVisible: false,
            appliedFilterDescription: computed<string>(() => {
                const desc: string[] = [];
                if (state.proxyFilters[FILTER.PROJECT]?.length) {
                    desc.push(`${state.proxyFilters[FILTER.PROJECT].length} Projects`);
                } if (state.proxyFilters[FILTER.SERVICE_ACCOUNT]?.length) {
                    desc.push(`${state.proxyFilters[FILTER.SERVICE_ACCOUNT].length} Service Accounts`);
                } if (state.proxyFilters[FILTER.PROVIDER]?.length) {
                    desc.push(`${state.proxyFilters[FILTER.PROVIDER].length} Providers`);
                }
                if (desc.length) return desc.join(' & ');
                return 'No Filter';
            }),
        });

        /* api */
        const updateFilters = async (filters) => {
            try {
                await SpaceConnector.client.costAnalysis.dashboard.update({
                    dashboard_id: props.dashboardId,
                    default_filter: filters,
                });
                state.proxyFilters = filters;
                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.MAIN.ALT_S_EDIT_FILTER'), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.MAIN.ALT_E_EDIT_FILTER'));
            }
        };

        /* event */
        const handleClickSelectFilter = () => {
            state.selectFilterModalVisible = true;
        };
        const handleClickViewFilter = () => {
            state.viewFilterModalVisible = true;
        };
        const handleConfirmSetFilter = (filters) => {
            updateFilters(filters);
        };

        return {
            ...toRefs(state),
            handleClickSelectFilter,
            handleClickViewFilter,
            handleConfirmSetFilter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.set-filter-part {
    @apply flex items-center;
    width: 100%;
    .applied-filter {
        margin-right: 0.5rem;
        .count {
            @apply text-gray-800;
        }
    }
}

@screen mobile {
    .set-filter-part {
        @apply flex flex-wrap;
        .applied-filter {
            width: 100%;
            .label {
                display: none;
            }
        }
    }
}
</style>
