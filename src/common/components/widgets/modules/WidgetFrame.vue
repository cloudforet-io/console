<template>
    <div class="widget-frame"
         :class="{
             [size]: true,
         }"
    >
        <header>
            <h3 class="title">
                {{ title }}
            </h3> <slot name="header-right" />
        </header>
        <div class="body">
            <slot />
        </div>
        <footer>
            <div class="footer-left">
                <p-datetime-picker style-type="text" select-mode="range" :selected-dates.sync="selectedDates" />
                <p-divider :vertical="true" />
                <currency-select-dropdown />
            </div>
            <div class="footer-right">
                <slot name="footer-right">
                    <router-link v-if="widgetLink && !printMode" :to="widgetLink" class="anchor-button">
                        {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FULL_DATA') }}
                        <p-i name="ic_arrow_right" width="1rem" height="1rem"
                             color="inherit transparent"
                        />
                    </router-link>
                </slot>
            </div>
        </footer>
    </div>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import { reactive, toRefs } from 'vue';

import { PDatetimePicker, PDivider, PI } from '@spaceone/design-system';
import { CARD_SIZE } from '@spaceone/design-system/src/data-display/cards/card/config';

import { useProxyValue } from '@/common/composables/proxy-state';

import CurrencySelectDropdown from '@/services/cost-explorer/modules/CurrencySelectDropdown.vue';

export default {
    name: 'WidgetFrame',
    components: {
        CurrencySelectDropdown,
        PDatetimePicker,
        PDivider,
        PI,
    },
    props: {
        title: {
            type: String,
            default: 'Title',
        },
        size: {
            type: String,
            default: CARD_SIZE.md,
            validator(size: any) {
                return Object.values(CARD_SIZE).includes(size);
            },
        },
        widgetLink: {
            type: [Object, String],
            default: undefined,
        },
        noData: {
            type: Boolean,
            default: false,
        },
        printMode: {
            type: Boolean,
            default: false,
        },
        // currency
    },
    setup(props, { emit }:SetupContext) {
        const state = reactive({
            selectedDates: useProxyValue('selectedDates', props, emit),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
@define-mixin widget-size $widget-width {
    & {
        height: 29rem;
        width: $widget-width;
    }
}

.widget-frame {
    border-color: theme('colors.gray.200');
    display: inline-flex;
    flex-direction: column;

    @apply border rounded-lg bg-white;
    header {
        @apply flex justify-between items-center;
        .title {
            font-size: 1rem;
            font-weight: 700;
            color: theme('colors.gray.900');
            line-height: 1.25;
            margin: 0.25rem 0;
        }
        padding: 0.75rem 1.5rem 1rem 1.5rem;
        border-color: inherit;
        flex: 0 0;
    }
    .body {
        height: auto;
        flex-grow: 1;
        flex-shrink: 1;
    }
    footer {
        @apply border-t rounded-b-lg flex justify-between items-center;
        padding: 0 1rem;
        flex: 0 0;
        .footer-left {
            @apply flex items-center gap-2;
            .p-divider {
                &.vertical {
                    height: 1rem;
                }
            }
        }
        .footer-right {
            .anchor-button {
                @apply flex items-center flex-shrink-0 text-sm text-blue-700 font-normal cursor-pointer;
                font-size: 0.75rem;
                line-height: 150%;
                margin-top: 0.1rem;
                &:hover {
                    @apply text-secondary underline;
                }
            }
        }
    }
    &.sm {
        @mixin widget-size 24rem;
    }
    &.md {
        @mixin widget-size 34.625rem;
    }
    &.lg {
        @mixin widget-size 44rem;
    }
}
</style>
