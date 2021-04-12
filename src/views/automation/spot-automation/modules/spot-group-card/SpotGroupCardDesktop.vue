<template>
    <article class="desktop-wrapper">
        <div class="spot-column">
            <p class="column-title">
                {{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.SPOT_INTERRUPT')}}
                <span class="text-xs text-gray-400">{{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.LAST_1_DAY')}}</span>
            </p>
            <p class="column-number">
                {{ cardData.interruptCount }}
                <span class="column-number-unit">{{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.NUMBER_UNIT')}}</span>
            </p>
            <spot-interrupt-chart
                :interrupt-data="cardData.interruptHistoryData"
                class="spot-interrupt-chart" />
            <span class="spot-interrupt-desc">{{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.ACTIVITY_TIME_RANGE')}}</span><br>
            <span class="spot-interrupt-desc">{{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.LAST_7_DAYS')}}</span>
        </div>
        <div class="spot-card-divider" />
        <div class="instance-column">
            <div class="column-title-wrapper">
                <div>
                    <p class="column-title">
                        {{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.INSTANCE')}}
                    </p>
                    <p class="column-number">
                        {{ cardData.instanceCount.total || 0 }}
                        <span class="column-number-unit">{{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.NUMBER_UNIT')}}</span>
                    </p>
                </div>
                <on-demand-and-spot-chart chart-type="short"
                                          :spot="cardData.instanceCount.spot"
                                          :ondemand="cardData.instanceCount.ondemand"
                                          class="on-demand-chart"
                />
            </div>
            <p class="column-title">
                {{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.CPU_UTILIZATION')}}
            </p>
            <p class="column-number">
                {{ cardData.instanceCpu || 0 }}
                <span class="column-number-unit">%</span>
            </p>
            <p class="column-title">
                {{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.DISK_USAGE')}}
            </p>
            <p class="column-number">
                {{ cardData.instanceDisk || 0 }}
                <span class="column-number-unit">IOPS</span><span>{{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.IOPS_DESC')}}</span>
            </p>
        </div>
        <div class="spot-card-divider" />
        <div class="load-balancer-column">
            <p class="column-title">
                {{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.INSTANCE_STATE')}}
            </p>
            <p class="column-info">
                <p-i v-if="cardData.instanceState === INSTANCE_STATE.healthy"
                     width="0.875rem"
                     height="0.875rem"
                     name="smile-face"
                />
                <p-lottie v-else-if="cardData.instanceState === INSTANCE_STATE.unhealthy"
                          name="lottie_error" auto :size="1.5"
                />
                <span v-else>
                    N/A
                </span>
                <span class="text" :class="cardData.instanceState">{{ cardData.instanceState }}</span>
            </p>
            <p class="column-title">
                {{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.LOAD_BALANCER')}}
            </p>
            <p class="column-number">
                {{ cardData.loadbalancerCount || 0 }}
                <span class="column-number-unit">{{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.NUMBER_UNIT')}}</span>
            </p>
            <p class="column-title">
                {{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.SERVICE_TYPE')}}
            </p>
            <p class="column-text">
                <p-i
                    width="1.5rem"
                    height="1.5rem"
                    name="ic_provider_aws"
                    class="mr-2"
                />
                {{ cardData.cloudServiceType.recommended_title || 'N/A' }}
            </p>
        </div>
    </article>
</template>

<script lang="ts">
import SpotInterruptChart from '@/views/automation/spot-automation/components/SpotInterruptChart.vue';
import OnDemandAndSpotChart from '@/views/automation/spot-automation/components/OnDemandAndSpotChart.vue';
import { PI } from '@spaceone/design-system';
import { INSTANCE_STATE } from '@/views/automation/spot-automation/lib/config';

export default {
    name: 'SpotGroupCardDesktop',
    components: { OnDemandAndSpotChart, SpotInterruptChart, PI },
    props: {
        cardData: {
            type: Object,
            default: () => ({}),
        },
        isShort: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        return {
            INSTANCE_STATE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.desktop-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 100%;
}
.column-title {
    @apply text-gray-500;
    font-size: 0.875rem;
    line-height: 100%;
    margin-bottom: 0.5rem;
}
.column-number {
    @apply text-gray-900 font-bold;
    font-size: 1.5rem;
    line-height: 100%;
    margin-bottom: 2rem;
}
.column-number-unit {
    @apply text-sm font-normal;
}
.spot-column {
    flex: 1;
    padding-top: 2rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    .spot-interrupt-desc {
        @apply text-gray-400;
        font-size: 0.75rem;
        line-height: 150%;
    }
}
.spot-interrupt-chart {
    margin: -2rem 0 1rem -1.5rem;
}
.instance-column {
    flex: 1;
    padding-top: 2rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;

    .column-title-wrapper {
        display: flex;
    }
    .on-demand-chart {
        margin-left: 0.5rem;
        margin-right: 1.5rem;
    }
}
.load-balancer-column {
    flex: 1;
    padding-top: 2rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    .column-info {
        margin-bottom: 2.6rem;
        .text {
            line-height: 100%;
            font-size: 0.875rem;
            margin-left: 0.125rem;
            &.healthy {
                @apply text-peacock-400;
            }
            &.alert {
                @apply text-red-500;
            }
        }
    }
    .column-text {
        font-size: 0.875rem;
        line-height: 100%;
    }
}
.spot-card-divider {
    margin-top: 2rem;
    margin-bottom: 2rem;
    border-left: 0.0625rem dashed rgba(theme('colors.gray.200'), 1);
}
</style>
