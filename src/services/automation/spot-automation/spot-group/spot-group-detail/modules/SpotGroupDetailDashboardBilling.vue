<template>
    <div class="spot-group-detail-dashboard-billing">
        <p class="title">
            {{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.TITLE') }}
        </p>
        <div class="widget-wrapper grid grid-cols-12">
            <p class="sub-title col-span-12">
                <span>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.INSTANCE_COUNT') }}</span>
            </p>
            <section class="billing-chart-section">
                <instance-billing-chart />
            </section>
            <section class="billing-figure-section">
                <spot-group-billing-summary
                    :saving-percentage="savingPercentage"
                    :saving-cost="savingCost"
                    :saving-result="savingResult"
                />
            </section>
            <p class="sub-title col-span-12">
                <span>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.BILLING_DETAIL') }}</span>
            </p>
            <section class="col-span-12 billing-table-section">
                <p-data-table
                    :loading="tableState.loading"
                    :fields="tableState.fields"
                    :items="tableState.data"
                >
                    <template #th-title-format>
                        <span />
                    </template>
                    <template #col-title-format="{value}">
                        <span class="col-title">{{ value }}</span>
                    </template>
                </p-data-table>
            </section>
        </div>
    </div>
</template>

<script lang="ts">
import {
    forEach, range, find,
} from 'lodash';
import dayjs from 'dayjs';

import {
    reactive, toRefs, watch, ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import { PDataTable } from '@spaceone/design-system';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import InstanceBillingChart from '@/services/automation/spot-automation/modules/InstanceBillingChart.vue';
import SpotGroupBillingSummary from '@/services/automation/spot-automation/modules/SpotGroupBillingSummary.vue';

import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';


interface TableData {
    date: string;
    normal_cost: null | number;
    saving_cost: null | number;
    instance_count: null | number;
}
const PERIOD = 6;

export default {
    name: 'SpotGroupDetailDashboardBilling',
    components: {
        SpotGroupBillingSummary,
        InstanceBillingChart,
        PDataTable,
    },
    props: {
        spotGroupId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: true,
            data: [],
            savingCost: 0,
            savingResult: 650,
            savingPercentage: 0,
        });
        const tableState = reactive({
            loading: true,
            fields: [] as DataTableField[],
            data: [] as TableData[],
        });

        /* util */
        const setTableFields = () => {
            const fields: DataTableField[] = [];
            forEach(range(0, PERIOD), (i) => {
                const currentDate = dayjs.utc().subtract(i, 'month');
                fields.unshift({
                    name: currentDate.format('YYYY-MM'),
                    label: currentDate.format('MMM/YYYY'),
                });
            });
            fields.unshift({ name: 'title', label: '' });
            tableState.fields = fields;
        };
        const setTableData = (rawData) => {
            const data = [] as TableData[];
            const fields = [
                {
                    name: 'saving_result',
                    title: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.SPOT_SAVINGS_COST'),
                },
                {
                    name: 'normal_cost',
                    title: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.ON_DEMAND_ESTIMATED_COST'),
                },
                {
                    name: 'instance_count',
                    title: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.INSTANCE_COUNT'),
                },
            ];

            fields.forEach((field) => {
                const rowData = { title: field.title } as any;
                forEach(range(0, PERIOD), (i) => {
                    const currentDate = dayjs.utc().subtract(i, 'month').format('YYYY-MM');
                    const currentData = find(rawData, { date: currentDate });
                    let result = '0';
                    if (currentData) {
                        result = commaFormatter(currentData[field.name]);
                    }
                    if (field.name !== 'instance_count') {
                        result = `$${result}`;
                    }
                    rowData[currentDate] = result;
                });
                data.push(rowData);
            });
            tableState.data = data;
        };

        /* api */
        const getBillingHistory = async (spotGroupId) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupSavingCostHistory({
                    spot_group_id: spotGroupId,
                    start: dayjs.utc().subtract(PERIOD - 1, 'month').format('YYYY-MM'),
                    end: dayjs.utc().format('YYYY-MM'),
                });
                setTableData(res.results);
            } catch (e) {
                console.error(e);
            }
        };

        (async () => {
            setTableFields();
        })();

        watch(() => props.spotGroupId, async (spotGroupId) => {
            if (spotGroupId) {
                tableState.loading = true;
                await getBillingHistory(spotGroupId);
                tableState.loading = false;
            }
        });

        return {
            ...toRefs(state),
            tableState,
            numberFormatter,
            commaFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-detail-dashboard-billing {
    .title {
        font-size: 1.5rem;
        line-height: 1.6;
        margin: 0.5rem 0;
    }

    .widget-wrapper {
        @apply border border-gray-200 bg-white;
        column-gap: 1rem;
        row-gap: 0.5rem;
        padding: 1rem;
        .sub-title {
            font-size: 1rem;
            font-weight: bold;
            line-height: 1.6;
            padding-bottom: 0.5rem;
        }
    }

    .billing-chart-section {
        @apply col-span-12;

        @screen md {
            @apply col-span-12;
        }

        @screen lg {
            @apply col-span-9;
        }
    }
    .billing-figure-section {
        @apply col-span-12;

        @screen md {
            @apply col-span-6;
        }

        @screen lg {
            @apply col-span-3;
        }
    }
    .billing-table-section {
        .p-data-table::v-deep {
            th {
                @apply border-gray-200 text-gray-400;
                font-size: 0.75rem;
            }
            td {
                @apply border-gray-200;
            }
            .col-title {
                @apply text-gray-600;
            }
        }
    }
}
</style>
