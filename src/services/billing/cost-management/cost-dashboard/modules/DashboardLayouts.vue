<template>
    <p-data-loader :loading="loading" :data="layout"
                   :min-loading-time="1000"
                   :lazy-loading-time="1000"
                   class="dashboard-layouts"
                   :class="{responsive: !printMode}"
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
                                :print-mode="printMode"
                                @rendered="handleDynamicWidgetInit"
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
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

type Row = string[]

interface Props {
    layout: Row[];
    printMode?: boolean;
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
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            widgetCount: computed<number>(() => props.layout.flat().length),
            renderedCount: 0,
            charts: [] as any[][],
            isAllRendered: computed<boolean>(() => {
                if (!props.layout.length) return false;
                return state.renderedCount >= state.widgetCount;
            }),
        });
        const handleDynamicWidgetInit = () => {
            state.renderedCount++;
        };
        watch(() => props.layout, () => {
            state.renderedCount = 0;
        });
        watch(() => state.isAllRendered, (isAllRendered) => {
            if (isAllRendered) emit('rendered');
        });
        return {
            ...toRefs(state),
            defaultWidgetMap,
            handleDynamicWidgetInit,
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
    }
    &.responsive {
        .data-loader-container .data-wrapper {
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
}

</style>
