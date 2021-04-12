<template>
    <div class="spot-group-billing">
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
                <div class="figure-wrapper">
                    <p class="title">
                        <span>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.LAST_MONTH') }}</span>
                        <strong> {{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.SAVINGS_COST') }}</strong>
                        <span class="percentage">
                            <p-i name="ic_decrease"
                                 width="1rem" height="1rem"
                            />
                            52%
                        </span>
                    </p>
                    <p class="cost">
                        ${{ commaFormatter(numberFormatter(lastMonthSavingCost)) }}
                    </p>
                </div>
                <div class="figure-wrapper">
                    <p class="title">
                        <strong>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.CUMULATIVE_SAVINGS_COST') }}</strong>
                    </p>
                    <p class="cost">
                        ${{ commaFormatter(numberFormatter(cumulativeSavingCost)) }}
                    </p>
                </div>
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
/* eslint-disable camelcase */
import dayjs from 'dayjs';
import { random } from 'lodash';

import {
    reactive, toRefs, watch, ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import {
    PI, PDataTable,
} from '@spaceone/design-system';
import InstanceBillingChart from '@/views/automation/spot-automation/components/InstanceBillingChart.vue';

import { SpaceConnector } from '@/lib/space-connector';


const DATA_TABLE_COLUMN = 6;

export default {
    name: 'SpotGroupBilling',
    components: {
        InstanceBillingChart,
        PI,
        PDataTable,
    },
    props: {
        spotGroup: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            data: [],
            lastMonthSavingCost: 1207.36234234,
            cumulativeSavingCost: 5690.23343,
        });
        const tableState = reactive({
            loading: false,
            fields: [] as any,
            data: [
                {
                    title: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.SPOT_SAVINGS'),
                },
                {
                    title: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.ON_DEMAND_ESTIMATED_COST'),
                },
                {
                    title: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.INSTANCE_COUNT'),
                },
            ],
        });

        /* util */
        const numberFormatter = (num) => {
            if (Math.abs(num) < 10000) {
                return Math.round(num * 100) / 100;
            }
            const options = { notation: 'compact', signDisplay: 'auto', maximumFractionDigits: 1 };
            return Intl.NumberFormat('en', options).format(num);
        };
        const commaFormatter = (num) => {
            if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return num;
        };
        const setTableFields = () => {
            const fields: any = [];
            let now = dayjs.utc();
            const start = now.subtract(DATA_TABLE_COLUMN, 'month');
            while (now.isAfter(start, 'month')) {
                // todo: 아래는 가라 데이터 만들려고 넣은 거임
                // eslint-disable-next-line no-loop-func
                tableState.data.forEach((d, idx) => {
                    let randomNum = random(1, 10).toString();
                    if (idx < 2) randomNum = `$${randomNum}`;
                    tableState.data[idx][now.format('YYYY-MM')] = randomNum;
                });
                fields.unshift({
                    name: now.format('YYYY-MM'),
                    label: now.format('MMM/YYYY'),
                });
                now = now.subtract(1, 'month');
            }
            fields.unshift({ name: 'title', label: '' });
            tableState.fields = fields;
        };

        const init = () => {
            setTableFields();
        };
        init();

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
.spot-group-billing {
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

        .figure-wrapper {
            margin-bottom: 1.25rem;
            .title {
                @apply text-gray-500;
                font-size: 0.875rem;
                line-height: 1.5;
                margin: 0;
                strong {
                    @apply text-gray-dark;
                }
                .percentage {
                    margin-left: 0.375rem;
                    .p-i-icon {
                        margin-right: -0.25rem;
                    }
                }
            }
            .cost {
                @apply text-indigo-500;
                font-size: 1.375rem;
                line-height: 1.45;
            }
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
