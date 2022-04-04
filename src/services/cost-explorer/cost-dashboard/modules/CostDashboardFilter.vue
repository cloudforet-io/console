<template>
    <div class="set-filter-part" :class="{responsive: !printMode}">
        <p class="applied-filter">
            <span class="label">{{ $t('BILLING.COST_MANAGEMENT.MAIN.APPLIED_FILTER') }}: </span>
            <span class="text">{{ getFiltersText(proxyFilters) }}</span>
        </p>
        <p-button v-if="!showSetting && !noFilter && !printMode"
                  style-type="gray-border"
                  size="sm"
                  @click.stop="handleClickViewFilter"
        >
            {{ $t('BILLING.COST_MANAGEMENT.MAIN.VIEW_FILTER') }}
        </p-button>
        <p-icon-button v-if="showSetting"
                       name="ic_setting" style-type="gray900" size="sm"
                       outline
                       @click="handleClickSelectFilter"
        />
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
import { isEmpty } from 'lodash';

import { computed, reactive, toRefs } from '@vue/composition-api';

import { PButton, PIconButton } from '@spaceone/design-system';
import ViewFilterModal from '@/services/cost-explorer/cost-dashboard/modules/ViewFilterModal.vue';
import SetFilterModal from '@/services/cost-explorer/modules/SetFilterModal.vue';

import { FILTER, FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { CostQueryFilterItemsMap, CostQueryFilters } from '@/services/cost-explorer/type';
import { ResourceItem } from '@/store/modules/reference/type';
import { makeProxy } from '@/lib/helper/composition-helpers';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { store } from '@/store';
import { i18n } from '@/translations';
import { getFiltersText } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import { DASHBOARD_TYPE } from '@/services/cost-explorer/cost-dashboard/lib/config';


interface Props {
    dashboardId: string;
    filters: CostQueryFilters;
    printMode: boolean;
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
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit, root }) {
        const state = reactive({
            isAdmin: computed(() => store.getters['user/isAdmin']),
            proxyFilters: makeProxy('filters', props, emit),
            filterItems: [
                { name: FILTER.PROJECT_GROUP, title: FILTER_ITEM_MAP[FILTER.PROJECT_GROUP].label },
                { name: FILTER.PROJECT, title: FILTER_ITEM_MAP[FILTER.PROJECT].label },
                { name: FILTER.SERVICE_ACCOUNT, title: FILTER_ITEM_MAP[FILTER.SERVICE_ACCOUNT].label },
                { name: FILTER.PROVIDER, title: FILTER_ITEM_MAP[FILTER.PROVIDER].label },
            ],
            filterItemsMap: computed<CostQueryFilterItemsMap>(() => {
                const itemsMap: CostQueryFilterItemsMap = {};
                const resourceItemsMap = {
                    project_id: store.state.reference.project.items,
                    service_account_id: store.state.reference.serviceAccount.items,
                    provider: store.state.reference.provider.items,
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
            noFilter: computed(() => isEmpty(state.filterItemsMap) || Object.values(state.proxyFilters).every(d => !d)),
            viewFilterModalVisible: false,
            selectFilterModalVisible: false,
            isUserDashboard: computed(() => (props.dashboardId?.startsWith(DASHBOARD_TYPE.USER))),
            showSetting: computed(() => ((!state.isAdmin && state.isUserDashboard) || state.isAdmin) && !props.printMode),
        });

        /* api */
        const updatePublicDashboardFilters = async (filters) => {
            try {
                await SpaceConnector.client.costAnalysis.publicDashboard.update({
                    public_dashboard_id: props.dashboardId,
                    default_filter: filters,
                });
                state.proxyFilters = filters;
                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.MAIN.ALT_S_EDIT_FILTER'), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.MAIN.ALT_E_EDIT_FILTER'));
            }
        };

        const updateUserDashboardFilters = async (filters) => {
            try {
                await SpaceConnector.client.costAnalysis.userDashboard.update({
                    user_dashboard_id: props.dashboardId,
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
            if (state.isUserDashboard) {
                updateUserDashboardFilters(filters);
            } else {
                updatePublicDashboardFilters(filters);
            }
        };

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/serviceAccount/load'),
                store.dispatch('reference/provider/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            getFiltersText,
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
        white-space: nowrap;
        .text {
            @apply text-gray-800;
        }
    }
    &.responsive {
        @screen mobile {
            @apply flex flex-wrap;
            .applied-filter {
                width: 100%;
                .label {
                    display: none;
                }
            }
        }
    }
}

</style>
