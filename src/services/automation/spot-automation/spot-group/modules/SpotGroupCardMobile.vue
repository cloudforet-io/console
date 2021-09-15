<template>
    <article class="mobile-wrapper">
        <div class="left-desc">
            <div class="card-content-text">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.INSTANCE') }}
                <span class="card-content-number">{{ cardData.instanceCount.total || 0 }} </span>{{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.NUMBER_UNIT') }}
                <span class="state-info">
                    <p-i v-if="cardData.instanceState === INSTANCE_STATE.healthy"
                         width="0.75rem"
                         height="0.75rem"
                         name="smile-face"
                    />
                    <p-lottie v-else-if="cardData.instanceState === INSTANCE_STATE.unhealthy"
                              name="lottie_error" auto :size="0.75"
                    />
                    <span v-else>
                        N/A
                    </span>
                    <span v-if="cardData.instanceState === INSTANCE_STATE.healthy" class="text" :class="cardData.instanceState">
                        {{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.HEALTHY')}}
                    </span>
                    <span v-if="cardData.instanceState === INSTANCE_STATE.unhealthy" class="text" :class="cardData.instanceState">
                        {{$t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.UNHEALTHY')}}
                    </span>
                </span>
            </div>
            <p class="card-content-text">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.CPU_UTILIZATION') }}<span class="card-content-number"> {{ cardData.instanceCpu || 0 }} </span>%
            </p>
            <p class="card-content-text">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.DISK_USAGE') }} <span class="card-content-number">{{ cardData.instanceDisk || 0 }} </span>IOPS
            </p>
            <p class="card-content-text">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.SPOT_INTERRUPT') }} <span class="card-content-number">{{ cardData.interruptCount }}</span>
            </p>
        </div>
        <div class="right-desc">
            <p class="card-content-text">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.LOAD_BALANCER') }} <span class="card-content-number">{{ cardData.loadbalancerCount || 0 }} </span>개
            </p>
            <p class="card-content-text">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.CARD.SERVICE_TYPE') }} <span>{{ cardData.cloudServiceType.name || 'N/A' }}</span>
            </p>
        </div>
    </article>
</template>

<script lang="ts">
import { INSTANCE_STATE } from '@/services/automation/spot-automation/lib/config';
import { PI } from '@spaceone/design-system';

export default {
    name: 'SpotGroupCardMobile',
    components: { PI },
    props: {
        cardData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        return {
            INSTANCE_STATE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.mobile-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem 1rem;

    .card-content-text {
        @apply text-gray-600;
        font-size: 0.75rem;
        line-height: 150%;
        margin-bottom: 0.25rem;
    }
    .card-content-number {
        @apply text-gray-900 font-bold;
        font-size: 0.75rem;
        line-height: 150%;
    }

    .state-info {
        margin-left: 0.25rem;
        .text {
            line-height: 100%;
            font-size: 0.75rem;
            margin-left: 0.125rem;
            &.healthy {
                @apply text-peacock-400;
            }
            &.alert {
                @apply text-red-500;
            }
        }
    }

    @screen sm {
        flex-direction: row;
        justify-content: start;
        .left-desc {
            width: 50%;
        }
    }
}
</style>
