<template>
    <p-data-loader :loading="loading" :data="layout"
                   :min-loading-time="1000"
                   :lazy-loading-time="1000"
                   class="dashboard-layouts"
    >
        <template #loader>
            <div />
        </template>
        <div v-for="(row, rowIdx) in layout" :key="`row-${rowIdx}`" class="row">
            <div v-for="({widget_id, options}) in row" :key="`widget-${widget_id}`" :class="`col-${row.length}`">
                <dynamic-widget v-if="!loading"
                                :widget-id="widget_id"
                                :widget-name="defaultWidgetMap[widget_id].widget_name"
                                :options="options"
                                :period="period"
                                :filters="filters"
                                :currency="currency"
                                :currency-rates="currencyRates"
                />
            </div>
        </div>
    </p-data-loader>
</template>

<script lang="ts">
import DynamicWidget from '@/services/billing/cost-management/cost-dashboard/modules/DynamicWidget.vue';
import { CURRENCY } from '@/store/modules/display/config';
import { PDataLoader } from '@spaceone/design-system';
import { defaultWidgetMap } from '@/services/billing/cost-management/widgets/lib/config';

type Row = string[]

interface Props {
    layout: Row[];
}

export default {
    name: 'DashboardLayouts',
    components: {
        DynamicWidget,
        PDataLoader,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        layout: {
            type: Array,
            default: () => [],
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        return {
            defaultWidgetMap,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-layouts::v-deep {
    margin-top: 1.5rem;
    .data-loader-container .data-wrapper {
        @apply flex flex-col;
        row-gap: 1rem;

        .row {
            @apply flex;
            column-gap: 1rem;
        }
        [class^='col-'] {
            width: 100%;
        }
        .col-1 {
            min-width: 60.75rem;
            width: 100%;
        }
        .col-2 {
            min-width: 29.875rem;
            width: 50%;
        }
        .col-3 {
            min-width: 19.5625rem;
            width: 33.33%;
        }

        @screen tablet {
            row-gap: 1rem;
            min-width: 100%;
            max-width: 100%;
            .row {
                @apply flex-col;
                row-gap: 1rem;
            }
            [class^='col-'] {
                width: 100%;
                min-width: 100%;
            }
        }
    }
}

</style>
