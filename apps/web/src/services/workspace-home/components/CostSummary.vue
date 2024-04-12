<script setup lang="ts">
import { PDivider, PFieldTitle, PLink } from '@spaceone/design-system';
</script>

<template>
    <div class="cost-summary">
        <p-field-title :label="$t('HOME.COST_SUMMARY_TITLE')"
                       size="lg"
                       class="main-title"
        />
        <div class="content-wrapper">
            <div class="price-wrapper">
                <div>
                    <p>{{ $t('HOME.COST_SUMMARY_CURRENT_MONTH') }}</p>
                    <p class="price">
                        <span class="unit">$</span>
                        <span>98,185.32</span>
                    </p>
                </div>
                <p>
                    <span>{{ $t('HOME.COST_SUMMARY_TOTAL_SPEND') }} </span>
                    <p-link highlight>
                        <span>$32,000.00</span>
                    </p-link>
                </p>
            </div>
            <div class="chart-wrapper" />
        </div>
        <p-divider />
        <p-link highlight
                action-icon="internal-link"
                class="link"
        >
            {{ $t('HOME.COST_SUMMARY_GO_TO_REPORT') }}
        </p-link>
    </div>
</template>

<style scoped lang="postcss">
.cost-summary {
    .main-title {
        padding-left: 1rem;
    }
    .content-wrapper {
        @apply flex flex-col;
        padding: 1.375rem 1.5rem 2.375rem;
        gap: 1.25rem;
        .price-wrapper {
            @apply flex flex-col text-label-md;
            padding-bottom: 2rem;
            gap: 1rem;
            .price {
                @apply text-display-md;
                margin-top: 0.25rem;
                .unit {
                    @apply text-display-sm text-gray-600;
                }
            }
        }
        .chart-wrapper {
            @apply bg-gray-100;
            height: 13rem;
        }
    }
    .link {
        @apply flex items-center justify-center text-label-md;
        padding-top: 0.625rem;
        padding-bottom: 0.75rem;
    }
}
</style>
