<template>
    <cost-dashboard-customize-widget-preview :layout="LAYOUT">
        <template #description>
            <div class="info-item">
                <p-label>Query Name</p-label> <span>{{ queryName }}</span>
            </div>
            <div class="info-item">
                <p-label>Granularity</p-label> <span>{{ getGranularityText(granularity) }}</span>
            </div>
            <div class="info-item">
                <p-label>Stack</p-label> <span>{{ stack ? 'On' : 'Off' }}</span>
            </div>
            <div class="info-item">
                <p-label>Group By</p-label> <span :class="{ 'text-gray-500': !groupBy }">{{ getGroupByText(groupBy) }}</span>
            </div>
            <div class="info-item">
                <p-label>Filters</p-label> <span :class="{'text-gray-500': !filters}">{{ getFiltersText(filters) }}</span>
            </div>
            <div class="info-item">
                <p-label>Start Date ~ End Date (UTC)</p-label> <span>{{ getPeriodText(period) }}</span>
            </div>
        </template>
        <template #extra>
            <p-anchor :to="getViewQueryLink()"
                      :show-icon="false"
                      class="btn-view-query"
            >
                <p-icon-text-button style-type="primary1" name="ic_plus_bold">
                    <span>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.VIEW_QUERY') }}</span>
                </p-icon-text-button>
            </p-anchor>
        </template>
    </cost-dashboard-customize-widget-preview>
</template>

<script lang="ts">
import { capitalize } from 'lodash';

import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PIconTextButton, PAnchor, PLabel,
} from '@spaceone/design-system';

import CostDashboardCustomizeWidgetPreview
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetPreview.vue';

import { CostQuerySetModel } from '@/services/billing/cost-management/type';
import dayjs from 'dayjs';
import { FILTER, GROUP_BY_ITEM_MAP } from '@/services/billing/cost-management/lib/config';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';


const LAYOUT = 100;

export default {
    name: 'CustomWidgetPreview',
    components: {
        CostDashboardCustomizeWidgetPreview,
        PIconTextButton,
        PAnchor,
        PLabel,
    },
    props: {
        selectedItem: {
            type: Object,
            default: () => ({}) as WidgetInfo | CostQuerySetModel,
        },
    },
    setup(props) {
        const state = reactive({
            queryName: computed(() => props.selectedItem?.name),
            granularity: computed(() => props.selectedItem?.options.granularity),
            stack: computed(() => props.selectedItem?.options.stack),
            period: computed(() => props.selectedItem?.options.period),
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
        const getPeriodText = (period) => {
            const startText = dayjs.utc(period?.start).format('YYYY/MM/DD');
            const endText = dayjs.utc(period?.end).format('YYYY/MM/DD');
            return `${startText} ~ ${endText}`;
        };
        const getFiltersText = (filters) => {
            if (!filters) return 'None';
            const desc: string[] = [];
            if (filters[FILTER.PROJECT_GROUP]?.length) {
                const filterLength = filters[FILTER.PROJECT_GROUP].length;
                const suffix = filterLength > 1 ? 'Project Groups' : 'Project Group';
                desc.push(`${filterLength} ${suffix}`);
            } if (filters[FILTER.PROJECT]?.length) {
                const filterLength = filters[FILTER.PROJECT].length;
                const suffix = filterLength > 1 ? 'Projects' : 'Project';
                desc.push(`${filterLength} ${suffix}`);
            } if (filters[FILTER.SERVICE_ACCOUNT]?.length) {
                const filterLength = filters[FILTER.SERVICE_ACCOUNT].length;
                const suffix = filterLength > 1 ? 'Service Accounts' : 'Service Account';
                desc.push(`${filterLength} ${suffix}`);
            } if (filters[FILTER.PROVIDER]?.length) {
                const filterLength = filters[FILTER.PROVIDER].length;
                const suffix = filterLength > 1 ? 'Providers' : 'Provider';
                desc.push(`${filterLength} ${suffix}`);
            }
            if (desc.length) return desc.join(' & ');
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
                    period: objectToQueryString(state.period),
                    filters: objectToQueryString(state.filters),
                },
            };
        };

        return {
            ...toRefs(state),
            LAYOUT,
            BILLING_ROUTE,
            getGranularityText,
            getGroupByText,
            getPeriodText,
            getFiltersText,
            getViewQueryLink,
        };
    },
};
</script>
<style lang="postcss" scoped>
.info-item {
    @apply mb-2;
    font-size: 0.875rem;
    .p-label {
        @apply mb-0 mr-2;
    }
}
.btn-view-query {
    @apply mt-2 ml-auto mr-auto;
    &:hover::v-deep .text {
        text-decoration: none;
    }
}
</style>
