<template>
    <div class="dashboard-layouts">
        <div v-for="(row, rowIdx) in layout" :key="`row-${rowIdx}`" :class="`row col-${row.length}`">
            <div v-for="(widgetId, widgetIdx) in row" :key="`widget-${widgetIdx}`">
                <dynamic-widget :widget-id="widgetId" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import { store } from '@/store';

import DynamicWidget from '@/services/billing/cost-management/cost-dashboard/modules/DynamicWidget.vue';

type Row = string[]

interface Props {
    layout: Row[];
}

export default {
    name: 'DashboardLayouts',
    components: {
        DynamicWidget,
    },
    props: {
        layout: {
            type: Array,
            default: () => [],
        },
    },
    setup() {
        const state = reactive({
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-layouts {
    @apply flex flex-col;
    row-gap: 1rem;
    margin-top: 1.5rem;

    .row {
        @apply flex;
        > * {
            width: 100%;
        }
        &.col-1 {
            > * {
                width: 100%;
            }
        }
        &.col-2 {
            column-gap: 1rem;
            > * {
                width: 50%;
            }
        }
        &.col-3 {
            column-gap: 1rem;
            > * {
                width: 33.33%;
            }
        }

        @screen tablet {
            &.col-2, &.col-3 {
                @apply flex-col;
                row-gap: 1rem;
                > * {
                    width: 100%;
                    min-width: 100%;
                }
            }
        }
    }
}

</style>
