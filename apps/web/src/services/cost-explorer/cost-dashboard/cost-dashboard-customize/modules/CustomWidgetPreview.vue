<template>
    <cost-dashboard-customize-widget-preview :layout="LAYOUT">
        <template #description>
            <div>
                <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LABEL_QUERY_NAME') }}</p-field-title>
                <span>{{ queryName }}</span>
            </div>
            <div>
                <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LABEL_GRANULARITY') }}</p-field-title>
                <span>{{ granularityLabel }}</span>
            </div>
            <div>
                <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LABEL_STACK') }}</p-field-title>
                <span>{{ stack ? 'On' : 'Off' }}</span>
            </div>
            <div>
                <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LABEL_GROUP_BY') }}</p-field-title>
                <span :class="{ 'text-gray-500': !groupBy }">{{ groupByLabel }}</span>
            </div>
            <div>
                <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LABEL_FILTERS') }}</p-field-title>
                <span :class="{'text-gray-500': noFilters }">{{ filterLabel }}</span>
            </div>
        </template>
        <template #extra>
            <p-button style-type="substitutive"
                      class="view-query-button"
                      @click="handleClickViewQuery"
            >
                <span>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.VIEW_QUERY') }}</span>
            </p-button>
        </template>
    </cost-dashboard-customize-widget-preview>
</template>

<script lang="ts">

import { computed, reactive, toRefs } from 'vue';
import type { Location } from 'vue-router/types/router';

import {
    PButton, PFieldTitle,
} from '@spaceone/design-system';
import { capitalize } from 'lodash';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import CostDashboardCustomizeWidgetPreview
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetPreview.vue';
import { getCostDashboardFilterLabel } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import type { WidgetInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';

const LAYOUT = 100;

export default {
    name: 'CustomWidgetPreview',
    components: {
        CostDashboardCustomizeWidgetPreview,
        PButton,
        PFieldTitle,
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
            filterLabel: computed(() => {
                const label = getCostDashboardFilterLabel(state.filters);
                return label ?? i18n.t('BILLING.COST_MANAGEMENT.MAIN.FILTER_NONE');
            }),
            groupByLabel: computed(() => {
                const groupBy = state.groupBy;
                if (groupBy) return GROUP_BY_ITEM_MAP[groupBy]?.label ?? groupBy;
                return i18n.t('BILLING.COST_MANAGEMENT.MAIN.FILTER_NONE');
            }),
        });

        /* Util */
        const getGranularityText = (granularity) => capitalize(granularity);
        const _getViewQueryLink = (): Location => {
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
                    group_by: arrayToQueryString([state.groupBy]),
                    filters: objectToQueryString(state.filters),
                    stack: primitiveToQueryString(state.stack),
                },
            };
        };

        /* Event */
        const handleClickViewQuery = () => {
            const route = SpaceRouter.router.resolve(_getViewQueryLink());
            window.open(route.href, '_blank');
        };

        return {
            ...toRefs(state),
            LAYOUT,
            COST_EXPLORER_ROUTE,
            getGranularityText,
            handleClickViewQuery,
        };
    },
};
</script>
<style lang="postcss" scoped>
.p-field-title {
    @apply mb-0 mr-2;
}
.view-query-button {
    @apply mt-2 ml-auto mr-auto;
}
</style>
