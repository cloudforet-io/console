<template>
    <cost-dashboard-customize-widget-preview :layout="LAYOUT">
        <template #description>
            <div>
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LABEL_QUERY_NAME') }}</p-label>
                <span>{{ queryName }}</span>
            </div>
            <div>
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LABEL_GRANULARITY') }}</p-label>
                <span>{{ granularityLabel }}</span>
            </div>
            <div>
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LABEL_STACK') }}</p-label>
                <span>{{ stack ? 'On' : 'Off' }}</span>
            </div>
            <div>
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LABEL_GROUP_BY') }}</p-label>
                <span :class="{ 'text-gray-500': !groupBy }">{{ getGroupByText(groupBy) }}</span>
            </div>
            <div>
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LABEL_FILTERS') }}</p-label>
                <span :class="{'text-gray-500': noFilters }">{{ getFiltersText(filters) }}</span>
            </div>
        </template>
        <template #extra>
            <p-anchor :to="getViewQueryLink()"
                      :icon-visible="false"
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
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetPreview.vue';

import { CostQuerySetModel } from '@/services/cost-explorer/type';
import { GRANULARITY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { WidgetInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { getFiltersText } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { i18n } from '@/translations';


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
            granularityLabel: computed(() => {
                if (state.granularity === GRANULARITY.ACCUMULATED) return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ACCUMULATED');
                if (state.granularity === GRANULARITY.MONTHLY) return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MONTHLY');
                return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DAILY');
            }),
            filters: computed(() => props.selectedItem?.options.filters),
            noFilters: computed(() => !state.filters || !Object.keys(state.filters).length),
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
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    params: { querySetId: queryId },
                };
            }
            return {
                name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
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
            COST_EXPLORER_ROUTE,
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
