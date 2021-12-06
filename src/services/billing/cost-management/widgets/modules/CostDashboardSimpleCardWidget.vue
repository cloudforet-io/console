<template>
    <p-pane-layout class="card-widget-layout">
        <template v-if="loading">
            <p-skeleton width="11rem" height="3rem" />
            <p-skeleton width="9.5rem" height="1rem" class="mb-5" />
            <p-skeleton width="14rem" height="1.75rem" />
        </template>
        <template v-else-if="noData">
            <div class="no-data">
                No Item
            </div>
        </template>
        <template v-else>
            <p class="title-wrapper">
                <span class="title">{{ title }}</span>
                <span v-if="$scopedSlots['title-extra']" class="title-extra">
                    <slot name="title-extra" />
                </span>
            </p>
            <p class="value-wrapper">
                <span v-if="unitType === UNIT_TYPE.CURRENCY" class="unit-type">{{ currencySymbol }}</span>
                <span class="value">{{ value }}</span>
                <span v-if="unitType === UNIT_TYPE.PERCENT" class="unit-type">%</span>
            </p>
            <span class="description">{{ description }}</span>
            <p-divider v-if="showDivider" class="divider" />
            <slot />
        </template>
    </p-pane-layout>
</template>

<script lang="ts">
import { PDivider, PPaneLayout, PSkeleton } from '@spaceone/design-system';
import { CURRENCY_SYMBOL } from '@/store/modules/display/config';


const UNIT_TYPE = Object.freeze({
    PERCENT: 'PERCENT',
    CURRENCY: 'CURRENCY',
});

type UNIT_TYPE = typeof UNIT_TYPE[keyof typeof UNIT_TYPE];

export default {
    name: 'CostDashboardSimpleCardWidget',
    components: {
        PPaneLayout,
        PDivider,
        PSkeleton,
    },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        title: {
            type: String,
            default: '',
        },
        currencySymbol: {
            type: String,
            default: '$',
            validator(value: CURRENCY_SYMBOL) {
                return Object.values(CURRENCY_SYMBOL).includes(value);
            },
        },
        unitType: {
            type: String,
            default: UNIT_TYPE.CURRENCY,
            validator(value: UNIT_TYPE) {
                return Object.values(UNIT_TYPE).includes(value);
            },
        },
        value: {
            type: [Number, String],
            default: 0,
        },
        showDivider: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
            default: '',
        },
        noData: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        return {
            UNIT_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.card-widget-layout {
    min-height: 12.8125rem;
    width: 100%;
    height: 100%;
    padding: 1rem 1.25rem;
    .title-wrapper {
        @apply flex text-gray-800;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        font-size: 1rem;
        line-height: 160%;
    }
    .value-wrapper {
        @apply text-gray-900;
        .value {
            @apply font-bold;
            height: 3rem;
            font-size: 2rem;
            line-height: 150%;
            margin: 0 0.125rem;
        }
        .unit-type {
            font-size: 1.375rem;
            line-height: 145%;
        }
        &.disabled {
            @apply text-gray-500;
        }
    }
    .description {
        @apply text-gray-500;
        font-size: 0.875rem;
        line-height: 150%;
    }
    .divider {
        margin-top: 0.75rem;
        margin-bottom: 0.75rem;
    }
    .no-data {
        @apply flex text-center justify-center items-center text-violet-300 font-bold;
        height: 100%;
        font-size: 0.875rem;
        line-height: 160%;
    }
}
</style>
