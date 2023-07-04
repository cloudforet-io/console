<template>
    <div class="dashboard-layouts">
        <p-data-loader :loading="loading"
                       :data="layout"
                       :min-loading-time="printMode ? 0 : 1000"
                       :lazy-loading-time="printMode ? 0 : 1000"
                       :loader-backdrop-color="BACKGROUND_COLOR"
                       :class="{responsive: !printMode}"
        >
            <template #no-data>
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.NO_WIDGET') }}
            </template>
            <template #loader>
                <div />
            </template>
            <div v-for="(row, rowIdx) in layout"
                 :key="`row-${row[0].name}-${contextId}-${rowIdx}`"
                 ref="dynamicWidgetRows"
                 class="row"
                 :class="{'customize':customizeMode}"
            >
                <div v-for="(widget, colIdx) in row"
                     :key="`widget-${widget.widget_id}-${contextId}-${colIdx}`"
                     :class="`col-${widget.options.layout}`"
                >
                    <div v-if="customizeMode"
                         class="btn-group"
                    >
                        <p-icon-button name="ic_edit"
                                       style-type="tertiary"
                                       shape="square"
                                       @click.stop="handleClickUpdate(rowIdx, colIdx, widget)"
                        />
                        <p-icon-button name="ic_delete"
                                       style-type="negative-secondary"
                                       shape="square"
                                       @click.stop="handleClickDelete(rowIdx, colIdx, widget)"
                        />
                    </div>
                    <dynamic-widget v-if="!loading"
                                    :widget-id="widget.widget_id"
                                    :name="widget.name"
                                    :widget-file-name="getWidgetFileName(widget)"
                                    :options="widget.options"
                                    :period="period"
                                    :filters="filters"
                                    :currency="currency"
                                    :currency-rates="currencyRates"
                                    :print-mode="printMode"
                                    @rendered="handleDynamicWidgetInit"
                    />
                </div>
                <template v-if="customizeMode && getAddWidgetColumnByLayout(row[0].options.layout, row.length) > 0">
                    <div v-for="n in getAddWidgetColumnByLayout(row[0].options.layout, row.length)"
                         :key="`${n}-${getUUID()}`"
                         :class="`col-${row[0].options.layout} empty-widget`"
                    >
                        <p-button style-type="secondary"
                                  icon-left="ic_plus_bold"
                                  @click="handleClickAdd(rowIdx, n, row[0].options.layout)"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET') }}
                        </p-button>
                    </div>
                </template>
            </div>
        </p-data-loader>
        <cost-dashboard-customize-widget-modal v-model="customizeModalVisible"
                                               @confirm="$emit('add-widget', $event)"
        />
        <delete-modal
            :header-title="checkDeleteState.headerTitle"
            :visible.sync="checkDeleteState.visible"
            :contents="$t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.FORM.DELETE_CONTENTS')"
            @confirm="handleDeleteConfirm"
        />
        <cost-dashboard-update-widget-modal v-if="updateModalVisible && customizeMode"
                                            v-model="updateModalVisible"
                                            @confirm="handleUpdateConfirm"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PDataLoader, PIconButton, PButton } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { CURRENCY } from '@/store/modules/settings/config';

import { getUUID } from '@/lib/component-util/getUUID';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import CostDashboardCustomizeWidgetModal
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetModal.vue';
import CostDashboardUpdateWidgetModal
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardUpdateWidgetModal.vue';
import DynamicWidget from '@/services/cost-explorer/cost-dashboard/modules/DynamicWidget.vue';
import type { WidgetInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';
import { defaultWidgetMap } from '@/services/cost-explorer/widgets/lib/config';


export default {
    name: 'DashboardLayouts',
    components: {
        CostDashboardUpdateWidgetModal,
        CostDashboardCustomizeWidgetModal,
        DynamicWidget,
        PDataLoader,
        DeleteModal,
        PIconButton,
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
        const costDashboardPageStore = useCostDashboardPageStore();

        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            widgetCount: computed<number>(() => props.layout.flat().length),
            renderedCount: 0,
            charts: [] as any[][],
            isAllRendered: computed<boolean>(() => {
                if (props.loading) return false;
                return state.renderedCount >= state.widgetCount;
            }),
            customizeModalVisible: false,
            updateModalVisible: false,
            contextId: getUUID(),
        });

        const checkDeleteState = reactive({
            visible: false,
            headerTitle: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.FORM.DELETE_TITLE'),
        });

        const getAddWidgetColumnByLayout = (widget, rowLength) => {
            if (widget === 33) return 3 - rowLength;
            if (widget === 50) return 2 - rowLength;
            if (widget === 100) return 1 - rowLength;
            return undefined;
        };

        const CUSTOM_WIDGET_FILE_NAME = 'CustomWidget';
        const getWidgetFileName = (widget) => defaultWidgetMap[widget.widget_id]?.widget_file_name ?? CUSTOM_WIDGET_FILE_NAME;

        const handleDynamicWidgetInit = () => {
            state.renderedCount++;
        };

        const handleClickUpdate = (rowIdx, colIdx, widget: WidgetInfo) => {
            costDashboardPageStore.$patch((_state) => {
                _state.widgetPosition = { row: rowIdx, col: colIdx };
                _state.originSelectedWidget = widget;
                _state.editedSelectedWidget = widget;
            });
            state.updateModalVisible = true;
        };

        const handleClickDelete = (rowIdx, colIdx, widget: WidgetInfo) => {
            costDashboardPageStore.$patch((_state) => {
                _state.widgetPosition = { row: rowIdx, col: colIdx };
                _state.editedSelectedWidget = widget;
            });
            checkDeleteState.visible = true;
        };

        const handleDeleteConfirm = () => {
            checkDeleteState.visible = false;
            emit('delete-widget');
        };

        const handleUpdateConfirm = () => {
            emit('update-widget');
        };

        const handleClickAdd = (rowIdx, colIdx, layout) => {
            costDashboardPageStore.$patch((_state) => {
                _state.widgetPosition = { row: rowIdx, col: colIdx };
                _state.layoutOfSpace = layout;
            });
            state.customizeModalVisible = true;
        };

        watch(() => props.layout, () => {
            state.renderedCount = 0;
        });

        watch(() => state.isAllRendered, (isAllRendered) => {
            if (isAllRendered) {
                const widgetRows: HTMLElement[] = vm.$refs.dynamicWidgetRows as HTMLElement[] ?? [];
                vm.$nextTick(() => {
                    // wait for animation. amcharts animation is global settings.
                    setTimeout(() => {
                        emit('rendered', widgetRows);
                    }, 1000);
                });
            }
        });
        return {
            ...toRefs(state),
            checkDeleteState,
            defaultWidgetMap,
            handleDynamicWidgetInit,
            handleClickUpdate,
            handleClickDelete,
            handleClickAdd,
            handleDeleteConfirm,
            handleUpdateConfirm,
            getAddWidgetColumnByLayout,
            getUUID,
            getWidgetFileName,
            BACKGROUND_COLOR,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-layouts {
    /* custom design-system component - p-data-loader */
    > :deep(.p-data-loader) {
        margin-top: 1.5rem;
        > .data-loader-container {
            > .data-wrapper {
                @apply flex flex-col;
                row-gap: 1rem;
            }
            > .no-data-wrapper {
                @apply text-gray-900;
                margin-top: 12.5rem;
            }
        }
    }

    .row {
        @apply flex;
        column-gap: 1rem;
        min-width: 60.75rem;
        min-height: 12.8125rem;
        [class^='col-'] {
            @apply relative w-full;
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

        &.customize {
            @apply border border-gray-300 rounded-lg;
            $border-width: 0.1875rem;

            border-width: $border-width;
            min-width: calc(60.75rem + $border-width * 2);

            .btn-group {
                @apply absolute z-10 flex gap-2;
                top: 1rem;
                right: 1rem;
            }
            .empty-widget {
                @apply grid bg-white border border-dashed border-gray-300 rounded-lg;
                place-content: center;
            }
        }
    }

    &.responsive {
        /* custom design-system component - p-data-loader */
        > :deep(.p-data-loader) {
            > .data-loader-container {
                > .data-wrapper {
                    @screen tablet {
                        row-gap: 1rem;
                        min-width: 100%;
                        max-width: 100%;
                    }
                }
            }
        }

        .row {
            @apply flex-col;
            row-gap: 1rem;
            min-width: auto;
        }
        [class^='col-'] {
            width: 100%;
            min-width: 100%;
        }
    }
}

</style>
