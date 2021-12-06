<template>
    <div class="dashboard-layouts">
        <div v-for="(row, rowIdx) in layout" :key="`row-${rowIdx}`" class="row">
            <div v-for="({widget_id, options}) in row" :key="`widget-${widget_id}`" :class="`col-${row.length}`">
                <dynamic-widget :widget-id="widget_id"
                                :options="options"
                                :period="period"
                                :filters="filters"
                                :currency="currency"
                                :currency-rates="currencyRates"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import DynamicWidget from '@/services/billing/cost-management/cost-dashboard/modules/DynamicWidget.vue';
import { CURRENCY } from '@/store/modules/display/config';

type Row = string[]

interface Props {
    layout: Row[];
}

export default {
    name: 'DashboardLayouts',
    components: {
        DynamicWidget,
    },
    props: {
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
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-layouts {
    @apply flex flex-col;
    row-gap: 1rem;
    margin-top: 1.5rem;

    .row {
        @apply flex;
        column-gap: 1rem;
    }
    [class^='col-'] {
        width: 100%;
    }
    .col-1 {
        width: 100%;
    }
    .col-2 {
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
        }
        .col-2, .col-3 {
            > * {
                width: 100%;
                min-width: 100%;
            }
        }
    }
}

</style>
