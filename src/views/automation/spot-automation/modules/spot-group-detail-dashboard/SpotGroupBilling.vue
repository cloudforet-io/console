<template>
    <div class="spot-group-billing">
        <p class="title">
            비용
        </p>
        <div class="widget-wrapper grid grid-cols-12">
            <p class="sub-title col-span-12">
                <span>인스턴스 개수</span>
                <span class="help-text">(지난 6개월)</span>
            </p>
            <section class="billing-chart-section">
                <instance-billing-chart />
            </section>
            <section class="billing-figure-section">
                <div class="figure-wrapper">
                    <p class="title">
                        <span>지난 달</span>
                        <strong> 절감 비용</strong>
                        <span class="percentage">
                            <p-i name="ic_table_sort_fromA" />
                            52%
                        </span>
                    </p>
                    <p class="cost">
                        ${{ commaFormatter(numberFormatter(lastMonthSavingCost)) }}
                    </p>
                </div>
                <div class="figure-wrapper">
                    <p class="title">
                        <strong>누적 절감 비용</strong>
                    </p>
                    <p class="cost">
                        ${{ commaFormatter(numberFormatter(cumulativeSavingCost)) }}
                    </p>
                </div>
            </section>
            <p class="sub-title col-span-12">
                <span>비용 내역</span>
                <span class="help-text">(지난 6개월)</span>
            </p>
            <section class="billing-table-section" />
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    PI,
} from '@spaceone/design-system';
import InstanceBillingChart from '@/views/automation/spot-automation/components/InstanceBillingChart.vue';

import {
    reactive, toRefs,
} from '@vue/composition-api';


export default {
    name: 'SpotGroupBilling',
    components: {
        InstanceBillingChart,
        PI,
    },
    setup() {
        const state = reactive({
            loading: false,
            data: [],
            lastMonthSavingCost: 1207.36234234,
            cumulativeSavingCost: 5690.23343,
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

        return {
            ...toRefs(state),
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
            .help-text {
                @apply text-gray-600;
                font-size: 0.75rem;
                font-weight: normal;
                padding-left: 0.25rem;
            }
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
}
</style>
