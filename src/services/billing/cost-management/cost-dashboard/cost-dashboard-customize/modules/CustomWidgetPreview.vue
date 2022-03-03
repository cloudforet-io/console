<template>
    <cost-dashboard-customize-widget-preview :layout="LAYOUT">
        <template #description>
            <div><p-label>Query Name</p-label> <span>{{ queryName }}</span></div>
            <div><p-label>Granularity</p-label> <span>{{ getGranularityText(granularity) }}</span></div>
            <div><p-label>Stack</p-label> <span>{{ stack ? 'On' : 'Off' }}</span></div>
            <div><p-label>Group By</p-label> <span :class="{ 'text-gray-500': !groupBy }">{{ getGroupByText(groupBy) }}</span></div>
            <div><p-label>Filters</p-label> <span :class="{'text-gray-500': !filters}">{{ getFiltersText(filters) }}</span></div>
        </template>
        <template #extra>
            <p-anchor :to="getViewQueryLink()"
                      :show-icon="false"
                      class="btn-view-query"
            >
                <p-button style-type="primary1">
                    <span>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.VIEW_QUERY') }}</span>
                </p-button>
            </p-anchor>
        </template>
    </cost-dashboard-customize-widget-preview>
</template>

<script lang="ts">
import { capitalize } from 'lodash';

import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PButton, PAnchor, PLabel,
} from '@spaceone/design-system';

import CostDashboardCustomizeWidgetPreview
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetPreview.vue';

import { CostQuerySetModel } from '@/services/billing/cost-management/type';
import { GROUP_BY_ITEM_MAP } from '@/services/billing/cost-management/lib/config';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { getFiltersText } from '@/services/billing/cost-management/cost-dashboard/lib/helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';


const LAYOUT = 100;

export default {
    name: 'CustomWidgetPreview',
    components: {
        CostDashboardCustomizeWidgetPreview,
        PButton,
        PAnchor,
        PLabel,
    },
    props: {
        selectedItem: {
            type: Object as () => WidgetInfo | CostQuerySetModel,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            queryName: computed(() => props.selectedItem?.name),
            granularity: computed(() => props.selectedItem?.options.granularity),
            stack: computed(() => props.selectedItem?.options.stack),
            groupBy: computed(() => {
                const options = props.selectedItem?.options;
                if (!options) return '';
                if (options.primary_group_by) return options.primary_group_by;
                if (Array.isArray(options.group_by)) return options.group_by[0];
                return options.group_by;
            }),
            filters: computed(() => props.selectedItem?.options.filters),
        });

        /* Util */
        const getGranularityText = granularity => capitalize(granularity);
        const getGroupByText = (groupBy) => {
            if (groupBy) return GROUP_BY_ITEM_MAP[groupBy].label;
            return 'None';
        };
        const getViewQueryLink = () => {
            const queryId = props.selectedItem?.cost_query_set_id;
            if (queryId) {
                return {
                    name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    params: { querySetId: queryId },
                };
            }
            return {
                name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                params: {},
                query: {
                    granularity: primitiveToQueryString(state.granularity),
                    groupBy: arrayToQueryString([state.groupBy]),
                    filters: objectToQueryString(state.filters),
                    stack: primitiveToQueryString(state.stack),
                },
            };
        };

        return {
            ...toRefs(state),
            LAYOUT,
            BILLING_ROUTE,
            getFiltersText,
            getGranularityText,
            getGroupByText,
            getViewQueryLink,
        };
    },
};
</script>
<style lang="postcss" scoped>
.p-label {
    @apply mb-0 mr-2;
}
.btn-view-query {
    @apply mt-2 ml-auto mr-auto;
    &:hover::v-deep .text {
        text-decoration: none;
    }
}
</style>
