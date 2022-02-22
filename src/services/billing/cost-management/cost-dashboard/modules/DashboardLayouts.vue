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
        <div v-for="(row, rowIdx) in layout" :key="`row-${rowIdx}`" ref="dynamicWidgetRows"
             class="row" :class="{'customize':customizeMode}"
        >
            <div v-for="(widget, colIdx) in row" :key="`widget-${widget.widget_id}-${getUUID()}`"
                 :class="[`col-${widget.options.layout}`, {'customize':customizeMode}]"
            >
                <div v-if="customizeMode" class="absolute bg-red-100 w-10 h-10 z-10" @click.stop="handleClickUpdate(rowIdx, colIdx, widget)">
                    update
                </div>
                <div v-if="customizeMode" class="absolute bg-blue-100 w-10 h-10 z-10 ml-10" @click.stop="handleClickDelete(rowIdx, colIdx, widget)">
                    delete
                </div>
                <dynamic-widget v-if="!loading"
                                :widget-id="widget.widget_id"
                                :widget-file-name="defaultWidgetMap[widget.widget_id].widget_file_name"
                                :options="widget.options"
                                :period="period"
                                :filters="filters"
                                :currency="currency"
                                :currency-rates="currencyRates"
                                :print-mode="printMode"
                                @rendered="handleDynamicWidgetInit"
                />
            </div>
            <template v-if="customizeMode">
                <div v-for="n in calcAddWidgetColumn(row[0].options.layout, row.length)"
                     :key="`${n}-${getUUID()}`" :class="[`col-${row[0].options.layout}`, {'customize':customizeMode}]"
                >
                    <p-button style-type="primary" :outline="true" @click="handleClickAdd(rowIdx, n, row[0].options.layout)">
                        Add Widget
                    </p-button>
                </div>
            </template>
        </div>
        <cost-dashboard-customize-widget-modal v-model="customizeModalVisible" @confirm="$emit('confirm',$event)" />
    </p-data-loader>
</template>

<script lang="ts">
import DynamicWidget from '@/services/billing/cost-management/cost-dashboard/modules/DynamicWidget.vue';
import { CURRENCY } from '@/store/modules/display/config';
import { PButton, PDataLoader } from '@spaceone/design-system';
import { defaultWidgetMap } from '@/services/billing/cost-management/widgets/lib/config';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { getUUID } from '@/lib/component-util/getUUID';
import CostDashboardCustomizeWidgetModal
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetModal.vue';
import { store } from '@/store';

type Row = string[]

interface Props {
    layout: Row[];
    printMode?: boolean;
}

export default {
    name: 'DashboardLayouts',
    components: {
        CostDashboardCustomizeWidgetModal,
        DynamicWidget,
        PDataLoader,
        PButton,
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
        customizeMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            widgetCount: computed<number>(() => props.layout.flat().length),
            renderedCount: 0,
            charts: [] as any[][],
            isAllRendered: computed<boolean>(() => {
                if (!props.layout.length) return false;
                return state.renderedCount >= state.widgetCount;
            }),
            customizeModalVisible: false,
        });

        const calcAddWidgetColumn = (widget, rowLength) => {
            if (widget === 33) return 3 - rowLength;
            if (widget === 50) return 2 - rowLength;
            if (widget === 100) return 1 - rowLength;
            return undefined;
        };

        const handleDynamicWidgetInit = () => {
            state.renderedCount++;
        };

        const handleClickUpdate = (rowIdx, colIdx, widget) => {
            console.log('update', rowIdx, colIdx, widget.name, widget.options);
        };

        const handleClickDelete = (rowIdx, colIdx, widget) => {
            console.log('delete', rowIdx, colIdx, widget.name, widget.options);
        };

        const handleClickAdd = (rowIdx, colIdx, layout) => {
            store.commit('service/costDashboard/setWidgetPosition', { row: rowIdx, col: colIdx });
            store.commit('service/costDashboard/setLayoutOfSpace', layout);
            state.customizeModalVisible = true;
        };

        watch(() => props.layout, () => {
            state.renderedCount = 0;
        });
        watch(() => state.isAllRendered, (isAllRendered) => {
            if (isAllRendered) {
                const widgetRows: HTMLElement[] = vm.$refs.dynamicWidgetRows as HTMLElement[] ?? [];
                emit('rendered', widgetRows);
            }
        });
        return {
            ...toRefs(state),
            defaultWidgetMap,
            handleDynamicWidgetInit,
            handleClickUpdate,
            handleClickDelete,
            handleClickAdd,
            calcAddWidgetColumn,
            getUUID,
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
            &.customize {
                @apply border border-gray-300;
            }
        }
        [class^='col-'] {
            width: 100%;
            &.customize {
                height: 100%;
                align-self: center;
            }
        }
        .col-100 {
            min-width: 60.75rem;
            width: 100%;
        }
        .col-50 {
            min-width: 29.875rem;
            width: 50%;
        }
        .col-33 {
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
