<template>
    <p-pane-layout class="card-widget-layout"
                   :class="{'inactive': !loading && noData}"
    >
        <p class="title-wrapper">
            <span class="title">{{ title }}</span>
            <span v-if="$slots['title-extra']"
                  class="title-extra"
            >
                <slot name="title-extra" />
            </span>
        </p>
        <div class="content-wrapper flex">
            <div v-if="loading"
                 class="flex flex-col"
            >
                <p-skeleton width="11rem"
                            height="3rem"
                />
                <p-skeleton width="9.5rem"
                            height="1rem"
                            class="mt-1 mb-6"
                />
                <p-skeleton width="14rem"
                            height="1.75rem"
                />
            </div>
            <div v-if="!loading && noData"
                 class="no-data"
            >
                No Item
            </div>
            <div v-else-if="!loading && !noData"
                 class="w-full"
            >
                <p class="value-wrapper">
                    <span v-if="unitType === UNIT_TYPE.CURRENCY"
                          class="unit-type"
                    >{{ currencySymbol }}</span>
                    <span class="value">{{ formattedValue }}</span>
                    <span v-if="unitType === UNIT_TYPE.PERCENT"
                          class="unit-type"
                    >%</span>
                </p>
                <span class="description">{{ description }}</span>
                <p-divider v-if="showDivider" />
                <slot />
                <router-link v-if="widgetLink"
                             :to="widgetLink"
                />
            </div>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { PDivider, PPaneLayout, PSkeleton } from '@spaceone/design-system';
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';
import type { RouteLocation } from 'vue-router';


import type { CurrencySymbol } from '@/store/modules/display/config';
import { CURRENCY_SYMBOL } from '@/store/modules/display/config';

const UNIT_TYPE = Object.freeze({
    PERCENT: 'PERCENT',
    CURRENCY: 'CURRENCY',
});
type UnitType = typeof UNIT_TYPE[keyof typeof UNIT_TYPE];

interface Props {
    loading: boolean;
    title: string;
    currencySymbol: CurrencySymbol;
    unitType: UnitType;
    value?: number|string;
    showDivider: boolean;
    description: string;
    noData: boolean;
    widgetLink?: RouteLocation|string;

}

export default defineComponent<Props>({
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
            type: String as PropType<CurrencySymbol>,
            default: CURRENCY_SYMBOL.USD,
            validator(value: CurrencySymbol) {
                return Object.values(CURRENCY_SYMBOL).includes(value);
            },
        },
        unitType: {
            type: String as PropType<UnitType>,
            default: UNIT_TYPE.CURRENCY,
            validator(value: UnitType) {
                return Object.values(UNIT_TYPE).includes(value);
            },
        },
        value: {
            type: [Number, String] as PropType<number|string>,
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
        widgetLink: {
            type: [Object, String] as PropType<RouteLocation|string>,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            formattedValue: computed<string|number>(() => {
                if (props.value === undefined) return 0;
                if (typeof props.value === 'string') return props.value;
                if (props.unitType === UNIT_TYPE.PERCENT) return props.value.toFixed(2);
                return props.value;
            }),
        });
        return {
            ...toRefs(state),
            UNIT_TYPE,
        };
    },
});
</script>

<style lang="postcss" scoped>
.card-widget-layout {
    @apply relative block;
    width: 100%;
    height: 100%;
    min-height: 12.8125rem;
    padding: 1rem 1.25rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06);
    &:hover:not(.inactive) {
        @apply bg-blue-100 cursor-pointer;
    }
    .title-wrapper {
        @apply flex text-gray-800;
        justify-content: space-between;
        margin-bottom: 0.25rem;
        font-size: 1rem;
        line-height: 160%;
    }
    .content-wrapper {
        height: calc(100% - 2rem);
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
    .p-divider {
        margin-top: 0.75rem;
        margin-bottom: 0.75rem;
    }
    .no-data {
        @apply m-auto text-violet-300 font-bold;
        font-size: 0.875rem;
        line-height: 160%;
    }
    a {
        @apply absolute top-0 left-0 w-full h-full;
    }
}
</style>
