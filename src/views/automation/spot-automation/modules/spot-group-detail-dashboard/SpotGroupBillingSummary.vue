<template>
    <div class="spot-group-billing-summary">
        <div class="summary-wrapper">
            <p class="title">
                <span>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.LAST_MONTH') }}</span>
                <strong> {{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.SAVING_COST') }}</strong>
                <span class="percentage">
                    <p-i name="ic_decrease"
                         width="0.75rem" height="0.75rem"
                    />
                    {{ savingPercentage }}%
                </span>
            </p>
            <p class="cost">
                <span class="dollar-sign">$</span>{{ commaFormatter(numberFormatter(savingCost)) }}
            </p>
        </div>
        <div class="summary-wrapper">
            <p class="title">
                <span v-if="sixMonthsAgo">{{ $t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.LAST_SIX_MONTHS') }} </span>
                <strong>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.CUMULATIVE_SAVINGS_COST') }}</strong>
            </p>
            <p class="cost">
                <span class="dollar-sign">$</span>{{ commaFormatter(numberFormatter(savingResult)) }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import {
    PI,
} from '@spaceone/design-system';

import { commaFormatter, numberFormatter } from '@/lib/util';

export default {
    name: 'SpotGroupBillingSummary',
    components: {
        PI,
    },
    props: {
        savingPercentage: {
            type: Number,
            default: 0,
        },
        savingCost: {
            type: Number,
            default: 0,
        },
        savingResult: {
            type: Number,
            default: 0,
        },
        sixMonthsAgo: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        return {
            commaFormatter,
            numberFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-billing-summary {
    .summary-wrapper {
        margin-bottom: 1rem;

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
            font-size: 1.5rem;
            line-height: 1.45;
            .dollar-sign {
                font-size: 1.25rem;
            }
        }
    }
}
</style>
