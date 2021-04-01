<template>
    <article class="desktop-wrapper">
        <div class="name-column" :class="{'short': isShort}">
            <p class="spot-group-title">
                {{ cardData.name }}
            </p>
            <p class="saving-cost">
                절감 비용
            </p>
            <p class="duration">
                이번달 1일 ~ 어제
            </p>
            <div class="cost">
                <span class="dollar">
                    $
                </span>
                125
            </div>
        </div>
        <div class="spot-card-divider" />
        <div class="spot-column">
            <p class="column-header">
                SPOT
            </p>
            <p class="column-title">
                스팟 인터럽트
                <span class="text-xs text-gray-400">Last hour</span>
            </p>
            <p class="column-number">
                6
                <span class="column-number-unit">개</span>
            </p>
            <spot-interrupt-chart class="spot-interrupt-chart" />
            <span class="spot-interrupt-desc">Activity graph time range:</span><br>
            <span class="spot-interrupt-desc">last 6 hours</span>
        </div>
        <div class="spot-card-divider" />
        <div class="instance-column">
            <p class="column-header">
                INSTANCE {{ cloudServiceData.status }}
            </p>
            <div class="column-title-wrapper">
                <div>
                    <p class="column-title">
                        인스턴스
                    </p>
                    <p class="column-number">
                        {{ cloudServiceData.instanceNum }}
                        <span class="column-number-unit">개</span>
                    </p>
                </div>
                <on-demand-and-spot-chart chart-type="short" class="on-demand-chart" />
            </div>
            <p class="column-title">
                인스턴스 평균 CPU 사용률
            </p>
            <p class="column-number">
                0
                <span class="column-number-unit">%</span>
            </p>
            <p class="column-title">
                평균 디스크 사용률
            </p>
            <p class="column-number">
                0
                <span class="column-number-unit">IOPS</span>
            </p>
        </div>
        <div class="spot-card-divider" />
        <div class="load-balancer-column">
            <p class="column-title">
                로드밸런서 (개수)
            </p>
            <p class="column-number">
                {{ cloudServiceData.loadbalancerNum }}
                <span class="column-number-unit">개</span>
            </p>
            <p class="column-title">
                서비스 타입
            </p>
            <p class="column-text">
                <p-i
                    width="1.5rem"
                    height="1.5rem"
                    name="ic_provider_aws"
                    class="mr-2"
                />
                Auto Scaling Group
            </p>
        </div>
    </article>
</template>

<script lang="ts">
import SpotInterruptChart from '@/views/automation/spot-automation/components/SpotInterruptChart.vue';
import OnDemandAndSpotChart from '@/views/automation/spot-automation/components/OnDemandAndSpotChart.vue';
import { PI } from '@spaceone/design-system';

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
        cloudServiceData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        return {

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

    @screen md {
        height: 3rem;
        .name-column {
            height: 100%;
            display: none;
        }
    }

    @screen lg {
        .name-column {
            display: flex;
            &.short {
                display: none;
            }
        }

    }
}
.name-column {
    flex: 1;
    flex-direction: column;
    padding-top: 2rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    .spot-group-title {
        @apply font-bold;
        font-size: 1.5rem;
        line-height: 135%;
        margin-bottom: 4.5rem;
    }
    .saving-cost {
        @apply text-gray-900 font-bold;
        font-size: 0.875rem;
        line-height: 100%;
        margin-bottom: 0.375rem;
    }
    .duration {
        @apply text-gray-900;
        font-size: 0.75rem;
        line-height: 100%;
        margin-bottom: 0.5rem;
    }
    .cost {
        @apply text-blue-500 font-bold;
        font-size: 2.75rem;
        line-height: 100%;
        .dollar {
            font-size: 1.5rem;
            font-weight: normal;
            line-height: 120%;
        }
    }
}
.column-header {
    @apply font-bold text-gray-300;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
    line-height: 100%;
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
    .column-text {
        font-size: 0.875rem;
        line-height: 100%;
    }
}
.spot-card-divider {
    border-left: 0.0625rem dashed rgba(theme('colors.gray.200'), 1);
    height: 100%;
}
</style>
