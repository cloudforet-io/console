<template>
    <p-pane-layout class="card-widget-layout">
        <p class="title-wrapper">
            <span class="title">{{ title }}</span>
            <span v-if="$scopedSlots['title-extra']" class="title-extra">
                <slot name="title-extra" />
            </span>
        </p>
        <p class="value-wrapper" :class="{disabled: value === 0.0 || value === 0}">
            <span v-if="unitType === UNIT_TYPE.CURRENCY" class="unit-type">{{ unit }}</span>
            <span class="value">{{ formattedValue }}</span>
            <span v-if="unitType === UNIT_TYPE.PERCENT" class="unit-type">%</span>
        </p>
        <span class="description">{{ description }}</span>
        <p-divider v-if="showDivider" class="divider" />
        <slot />
    </p-pane-layout>
</template>

<script lang="ts">
import { PDivider, PPaneLayout } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { CURRENCY } from '@/services/billing/cost-management/cost-analysis/lib/config';

const UNIT_TYPE = Object.freeze({
    PERCENT: 'PERCENT',
    CURRENCY: 'CURRENCY',
});

type UNIT_TYPE = typeof UNIT_TYPE[keyof typeof UNIT_TYPE];

export default {
    name: 'CardWidgetLayout',
    components: {
        PPaneLayout,
        PDivider,
    },
    props: {
        title: {
            type: String,
            default: '',
        },
        unit: {
            type: String,
            default: CURRENCY.USD,
            validator(value: CURRENCY) {
                return Object.values(CURRENCY).includes(value);
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
            type: Number,
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
    },
    setup(props) {
        const state = reactive({
            formattedValue: computed(() => (props.unitType === UNIT_TYPE.CURRENCY ? props.value.toFixed(2) : props.value)),
        });
        return {
            ...toRefs(state),
            CURRENCY,
            UNIT_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.card-widget-layout {
    min-width: 22rem;
    max-height: 12.81rem;
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
}
</style>
