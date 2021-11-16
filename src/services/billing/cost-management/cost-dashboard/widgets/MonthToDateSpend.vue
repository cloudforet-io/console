<template>
    <card-widget-layout
        :title="'Month-to-Date Spend'"
        unit-type="CURRENCY"
        :unit="CURRENCY.USD"
        :value="17856"
        :description="'Aug 1 ~ 18, 2021'"
    >
        <template #default>
            <div class="cost-trend-wrapper">
                <span class="rate" :class="[{safe: rate < 0}, {alert: rate > 0}]">
                    <p-i v-if="rate < 0" name="ic_arrow-down v1" width="1rem"
                         height="1rem"
                    />
                    <p-i v-else name="ic_arrow-up v1" width="1rem"
                         height="1rem"
                    />
                    {{ rate }}%
                </span>
                <span class="cost">
                    <p-i v-if="cost < 0" name="ic_arrow-down v1" width="1rem"
                         height="1rem"
                    />
                    <p-i v-else name="ic_arrow-up v1" width="1rem"
                         height="1rem"
                    /><span class="unit">$</span> 9,335.50
                </span>
            </div>
            <div class="range">
                Decreased from Oct 1 ~ 20, 2021
            </div>
        </template>
    </card-widget-layout>
</template>

<script lang="ts">
import CardWidgetLayout from '@/services/billing/cost-management/cost-dashboard/modules/SimpleCardWidget.vue';
import { CURRENCY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { PI } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'MonthToDateSpend',
    components: {
        CardWidgetLayout,
        PI,
    },

    setup() {
        const state = reactive({
            rate: -4.5,
            cost: -9335.5,
        });

        return {
            ...toRefs(state),
            CURRENCY,
        };
    },
};
</script>

<style lang="postcss" scoped>
.rate {
    margin-left: 0.125rem;
    font-size: 1.125rem;
    line-height: 155%;
    &.safe {
        @apply text-safe;
    }
    &.alert {
        @apply text-alert;
    }
}
.cost {
    @apply text-gray-800 font-bold;
    font-size: 1.125rem;
    line-height: 155%;
    .unit {
        @apply font-normal;
        font-size: 1rem;
        line-height: 160%;
    }
}
.range {
    @apply text-gray-500;
    font-size: 0.875rem;
    line-height: 150%;
}

</style>
