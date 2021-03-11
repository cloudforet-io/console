<template>
    <div class="spot-group-monitoring">
        <p class="title">
            <span>모니터링</span>
            <span class="help-text">(데이터 기준: 1일 평균값)</span>
        </p>
        <div class="box-wrapper grid grid-cols-12 gap-3">
            <div v-for="(d, idx) of dataList" :key="idx"
                 class="box col-span-6 sm:col-span-3 md:col-span-3 lg:col-span-3"
                 :class="[{'selected': idx === selectedIndex}, d.status]"
                 @click="onClickBox(idx)"
            >
                <div class="content">
                    <p class="pb-2">
                        <template v-if="d.status === 'unhealthy'">
                            <span class="count">{{ d.unhealthyCount }}</span>
                            <span class="suffix">/ {{ d.count }}{{ d.suffix }}</span>
                        </template>
                        <template v-else>
                            <span class="count">{{ d.count }}</span>
                            <span class="suffix">{{ d.suffix }}</span>
                        </template>
                    </p>
                    <p>
                        <span class="type">{{ d.type }}</span>
                        <span v-if="d.detail" class="detail">{{ d.detail }}</span>
                        <span class="status" :class="d.status">
                            <template v-if="d.status === 'healthy'">
                                <p-i class="status-icon" name="smile-face"
                                     width="1rem" height="1rem"
                                     color="inherit transparent"
                                />
                            </template>
                            <template v-if="d.status === 'unhealthy'">
                                <p-lottie class="status-icon" :size="1" :auto="true"
                                          name="lottie_error"
                                />
                            </template>
                        </span>
                    </p>
                </div>
            </div>
        </div>
        <div class="widget-wrapper">
            <monitoring :show-tools="false" />
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    PI, PLottie,
} from '@spaceone/design-system';
import Monitoring from '@/common/modules/monitoring/Monitoring.vue';

import { computed, reactive, toRefs } from '@vue/composition-api';


export default {
    name: 'SpotGroupMonitoring',
    components: {
        Monitoring,
        PI,
        PLottie,
    },
    setup(props) {
        const state = reactive({
            dataList: computed(() => ([
                {
                    type: '인스턴스',
                    detail: 'CPU 사용률',
                    count: 20,
                    suffix: '%',
                },
                {
                    type: '인스턴스',
                    detail: '디스크 사용률',
                    count: 3570,
                    suffix: 'IOPS',
                },
                // {
                //     type: '인스턴스',
                //     detail: '정상',
                //     status: 'healthy',
                //     count: 10,
                //     suffix: '개',
                // },
                {
                    type: '인스턴스',
                    detail: '문제있음',
                    status: 'unhealthy',
                    unhealthyCount: 3,
                    count: 10,
                    suffix: '개',
                },
                {
                    type: '로드밸런서',
                    count: 4,
                    suffix: '개',
                },
            ])),
            selectedIndex: 0,
        });

        /* event */
        const onClickBox = (idx) => {
            state.selectedIndex = idx;
        };

        return {
            ...toRefs(state),
            onClickBox,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-monitoring {
    .title {
        font-size: 1.5rem;
        line-height: 1.6;
        margin: 0.5rem 0;
        .help-text {
            @apply text-gray-500;
            font-size: 0.75rem;
            padding-left: 0.25rem;
        }
    }
    .box-wrapper {
        padding-bottom: 1.25rem;
        .box {
            @apply border border-gray-200;
            position: relative;
            display: flex;
            height: 7.25rem;
            cursor: pointer;
            border-radius: 0.375rem;
            padding-left: 1rem;

            @screen lg {
                padding-left: 1.25rem;
            }

            &:hover {
                @apply bg-secondary2;
            }
            &.selected {
                @apply bg-primary1 border-primary1 text-white;
                &::after {
                    position: absolute;
                    display: none;
                    content: '';
                    width: 0;
                    border-style: solid;
                    border-color: theme('colors.primary1') transparent;
                    border-width: 0.5rem 0.5rem 0;
                    bottom: -0.5rem;
                    left: 50%;
                    margin-left: -0.5rem;

                    @screen sm {
                        display: block;
                    }
                }
                .content {
                    .count, .suffix {
                        @apply text-white;
                    }
                }
            }
            &.healthy {
                .content {
                    .detail, .status {
                        @apply text-peacock-400;
                    }
                }
                &.selected {
                    .content {
                        .detail, .status {
                            @apply text-white;
                        }
                    }
                }
            }
            &.unhealthy {
                @apply text-alert;
                &.selected {
                    @apply bg-red-400 border-red-400 text-white;
                    &::after {
                        border-color: theme('colors.red.400') transparent;
                    }
                    .content {
                        .count, .suffix {
                            @apply text-white;
                        }
                        .status .status-icon {
                            @apply bg-white;
                            border-radius: 50%;
                        }
                    }
                }
                .content {
                    .count, .suffix {
                        @apply text-alert;
                    }
                }
            }

            .content {
                position: relative;
                margin: auto 0;
                .count {
                    @apply text-indigo-400;
                    font-size: 2rem;
                    font-weight: bold;
                    line-height: 1;
                }
                .suffix {
                    @apply text-indigo-400;
                    font-size: 1rem;
                    line-height: 1;
                    padding-left: 0.25rem;
                }
                .type {
                    font-size: 0.875rem;
                    line-height: 1.4;
                }
                .detail {
                    font-size: 0.875rem;
                    font-weight: bold;
                    line-height: 1.4;
                    padding-left: 0.25rem;
                }
                .status {
                    font-size: 0.875rem;
                    .status-icon {
                        display: inline-block;
                        vertical-align: sub;
                        margin-left: 0.25rem;
                    }
                }
            }
        }
    }
    .widget-wrapper {
        @apply border border-gray-200;
    }
}
</style>
