<template>
    <div class="spot-group-monitoring">
        <p class="title">
            <span>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.TITLE') }}</span>
            <span class="help-text">({{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.TITLE_HELP_TEXT') }})</span>
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
                            <span class="count">{{ instanceState.unhealthyCount }}</span>
                            <span class="suffix">/ {{ d.count }}{{ d.suffix }}</span>
                        </template>
                        <template v-else>
                            <span class="count">{{ commaFormatter(d.count) }}</span>
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
            <template v-if="selectedIndex === 0">
                <monitoring :show-tools="false"
                            :resources="resources"
                            :resource-type="resourceType"
                            :selected-metrics="cpuUsageMetrics"
                            :responsive="true"
                />
            </template>
            <template v-else-if="selectedIndex === 1">
                <monitoring :show-tools="false"
                            :resources="resources"
                            :resource-type="resourceType"
                            :selected-metrics="diskUsageMetrics"
                            :responsive="true"
                />
            </template>
            <template v-else-if="selectedIndex === 2">
                <p-dynamic-layout type="query-search-table"
                                  class="resource-table"
                                  :options="instanceState.schema.options"
                                  :data="instanceState.data"
                />
            </template>
            <template v-else>
                로드밸런서
            </template>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get, find } from 'lodash';
import {
    computed, reactive, toRefs, watch, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PI, PLottie, PDynamicLayout,
} from '@spaceone/design-system';
import Monitoring from '@/common/modules/monitoring/Monitoring.vue';

import { SpaceConnector } from '@/lib/space-connector';


export default {
    name: 'SpotGroupMonitoring',
    components: {
        Monitoring,
        PI,
        PLottie,
        PDynamicLayout,
    },
    props: {
        spotGroup: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const instanceState = reactive({
            count: 0,
            unhealthyCount: 0,
            schema: {},
            fields: [],
            data: [],
        });
        const state = reactive({
            resourceType: 'inventory.Server',
            resources: [],
            selectedIndex: 0,
            cpuUsageMetrics: ['CPUUtilization'],
            diskUsageMetrics: ['EBSReadOps', 'EBSWriteOps', 'EBSReadBytes', 'EBSWriteBytes'],
            dataList: computed(() => ([
                {
                    type: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.INSTANCE'),
                    detail: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.CPU_USAGE_RAGE'),
                    count: 20,
                    suffix: '%',
                },
                {
                    type: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.INSTANCE'),
                    detail: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.DISK_USAGE_RATE'),
                    count: 3570,
                    suffix: 'IOPS',
                },
                {
                    type: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.INSTANCE'),
                    detail: instanceState.unhealthyCount > 0 ? vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.HAS_PROBLEM') : vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.NORMAL'),
                    status: instanceState.unhealthyCount > 0 ? 'unhealthy' : 'healthy',
                    count: instanceState.count,
                    suffix: '개',
                },
                {
                    type: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.LOAD_BALANCER'),
                    count: 4,
                    suffix: '개',
                },
            ])),
        });

        /* util */
        const commaFormatter = (num) => {
            if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return num;
        };

        /* api */
        const getInstanceSchema = async (spotGroup) => {
            try {
                const schema = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: 'inventory.CloudService',
                    schema: 'details',
                    options: {
                        provider: spotGroup.provider,
                        cloud_service_id: spotGroup.resource_id,
                        cloud_service_group: spotGroup.cloud_service_group,
                        cloud_service_type: spotGroup.cloud_service_type,
                    },
                });
                const instanceSchema = find(schema.details, { name: 'Instances' });
                instanceState.schema = instanceSchema;
                instanceState.fields = instanceSchema?.options?.fields;
            } catch (e) {
                console.error(e);
            }
        };
        const getInstance = async (spotGroup) => {
            try {
                const res = await SpaceConnector.client.inventory.cloudService.get({ cloud_service_id: spotGroup.resource_id });
                const instances = get(res, 'data.instances');
                instanceState.data = instances;
                instanceState.count = instances.length;
                instanceState.unhealthyCount = (instances.filter(d => d.health_status !== 'Healthy')).length;
            } catch (e) {
                console.error(e);
            }
        };
        const getSpotGroupServers = async (spotGroup) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupServers({
                    spot_group_id: spotGroup.spot_group_id,
                });
                state.resources = res.results.map(d => ({ id: d.server_id, name: d.name }));
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onClickBox = (idx) => {
            if (state.selectedIndex !== idx) {
                state.selectedIndex = idx;
            }
        };

        watch(() => props.spotGroup, (spotGroup) => {
            getInstanceSchema(spotGroup);
            getInstance(spotGroup);
            getSpotGroupServers(spotGroup);
        }, { immediate: false });

        return {
            ...toRefs(state),
            instanceState,
            onClickBox,
            commaFormatter,
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
