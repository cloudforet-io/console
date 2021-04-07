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
            <template v-if="selectedIndex < 2">
                <monitoring v-if="resources.length > 0"
                            :show-tools="false"
                            :resources="resources"
                            :resource-type="resourceType"
                            :selected-metrics="metrics"
                            :responsive="true"
                />
            </template>
            <template v-else>
                <p-dynamic-layout type="table"
                                  class="resource-table"
                                  :data="instanceState.data"
                                  :options="instanceState.schema.options"
                                  :fetch-options="fetchOptionState"
                                  @fetch="fetchTableData"
                />
            </template>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get } from 'lodash';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PDynamicLayout, PI, PLottie } from '@spaceone/design-system';
import Monitoring from '@/common/modules/monitoring/Monitoring.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';


enum SCHEMA_TYPE {
    INSTANCE = 'INSTANCE',
    LOAD_BALANCER = 'LOAD_BALANCER',
}
enum METRIC_TYPE {
    CPU = 'CPU',
    DISK = 'DISK',
}

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
        const apiQuery = new ApiQueryHelper();
        const instanceState = reactive({
            count: 0,
            unhealthyCount: 0,
            status: 'healthy',
            schema: {},
            fields: [],
            data: [],
        });
        const state = reactive({
            cloudServiceId: '',
            resourceType: 'inventory.Server',
            resources: [],
            selectedIndex: 0,
            schemaType: '' as keyof typeof SCHEMA_TYPE,
            metricType: METRIC_TYPE.CPU as keyof typeof METRIC_TYPE,
            metrics: [] as string[],
            instanceCpuUsage: 0,
            instanceDiskUsage: 0,
            loadBalancerCount: 0,
            dataList: computed(() => ([
                {
                    type: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.INSTANCE'),
                    detail: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.CPU_USAGE_RAGE'),
                    count: state.instanceCpuUsage,
                    suffix: '%',
                },
                {
                    type: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.INSTANCE'),
                    detail: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.DISK_USAGE_RATE'),
                    count: state.instanceDiskUsage,
                    suffix: 'IOPS',
                },
                {
                    type: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.INSTANCE'),
                    detail: instanceState.status === 'healthy' ? vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.NORMAL') : vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.HAS_PROBLEM'),
                    status: instanceState.status === 'healthy' ? 'healthy' : 'unhealthy',
                    count: instanceState.count,
                    suffix: '개',
                },
                {
                    type: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.LOAD_BALANCER'),
                    count: state.loadBalancerCount,
                    suffix: '개',
                },
            ])),
        });
        const fetchOptionState = reactive({
            pageStart: 1,
            pageLimit: 15,
            sortDesc: true,
            sortBy: '',
            searchText: '',
        });

        /* util */
        const commaFormatter = (num) => {
            if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return num;
        };

        /* api */
        const getInstanceCpuUsage = async (spotGroup) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceCpu({
                    spot_groups: [spotGroup.spot_group_id],
                });
                state.instanceCpuUsage = get(res, `spot_groups.${spotGroup.spot_group_id}.cpu_utilization`);
            } catch (e) {
                console.error(e);
            }
        };
        const getInstanceDiskUsage = async (spotGroup) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceDisk({
                    spot_groups: [spotGroup.spot_group_id],
                });
                state.instanceDiskUsage = get(res, `spot_groups.${spotGroup.spot_group_id}.total_iops`);
            } catch (e) {
                console.error(e);
            }
        };
        const getInstanceState = async (spotGroup) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceState({
                    spot_groups: [spotGroup.spot_group_id],
                });
                const spotGroupId = spotGroup.spot_group_id;
                instanceState.count = get(res, `spot_groups.${spotGroupId}.total`);
                instanceState.unhealthyCount = get(res, `spot_groups.${spotGroupId}.unhealthy`);
                instanceState.status = get(res, `spot_groups.${spotGroupId}.state`);
            } catch (e) {
                console.error(e);
            }
        };
        const getLoadBalancerCount = async (spotGroup) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupLoadbalancerCount({
                    spot_groups: [spotGroup.spot_group_id],
                });
                state.loadBalancerCount = get(res, `spot_groups.${spotGroup.spot_group_id}`);
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
        const getSpotGroupMetrics = async (spotGroup) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupMetrics({
                    spot_group_id: spotGroup.spot_group_id,
                    metric_type: state.metricType,
                });
                state.metrics = res.metrics;
            } catch (e) {
                console.error(e);
            }
        };
        const getInstanceSchema = async (spotGroup) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupSchema({
                    spot_group_id: spotGroup.spot_group_id,
                    schema_type: state.schemaType,
                });
                state.cloudServiceId = res.cloud_service_id;
                instanceState.schema = res.schema;
            } catch (e) {
                console.error(e);
            }
        };
        const getInstanceQuery = () => {
            apiQuery
                .setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilters([{ v: fetchOptionState.searchText }]);
            return apiQuery.data;
        };
        const getInstance = async (spotGroup) => {
            await getInstanceSchema(spotGroup);

            try {
                const res = await SpaceConnector.client.inventory.cloudService.getData({
                    cloud_service_id: state.cloudServiceId,
                    query: getInstanceQuery(),
                    key_path: get(instanceState.schema, 'options.root_path'),
                });
                instanceState.data = res.results;
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onClickBox = (idx) => {
            if (state.selectedIndex !== idx) {
                state.selectedIndex = idx;
                switch (idx) {
                case 0:
                    state.metricType = METRIC_TYPE.CPU;
                    break;
                case 1:
                    state.metricType = METRIC_TYPE.DISK;
                    break;
                case 2:
                    state.schemaType = SCHEMA_TYPE.INSTANCE;
                    break;
                case 3:
                    state.schemaType = SCHEMA_TYPE.LOAD_BALANCER;
                    break;
                default:
                    break;
                }
            }
        };
        const fetchTableData = (options, changed) => {
            if (changed) {
                if (changed.sortBy !== undefined) {
                    fetchOptionState.sortBy = changed.sortBy;
                    fetchOptionState.sortDesc = !!changed.sortDesc;
                }
                if (changed.pageLimit !== undefined) {
                    fetchOptionState.pageLimit = changed.pageLimit;
                }
                if (changed.pageStart !== undefined) {
                    fetchOptionState.pageStart = changed.pageStart;
                }
                if (changed.searchText !== undefined) {
                    fetchOptionState.searchText = changed.searchText;
                }
            }
            getInstance(props.spotGroup);
        };

        watch(() => props.spotGroup, (spotGroup) => {
            getInstanceCpuUsage(spotGroup);
            getInstanceDiskUsage(spotGroup);
            getInstanceState(spotGroup);
            getLoadBalancerCount(spotGroup);

            getSpotGroupServers(spotGroup);
            getSpotGroupMetrics(spotGroup);
        }, { immediate: false });

        watch(() => state.metricType, () => {
            getSpotGroupMetrics(props.spotGroup);
        }, { immediate: false });

        watch(() => state.schemaType, () => {
            getInstance(props.spotGroup);
        }, { immediate: false });

        return {
            ...toRefs(state),
            instanceState,
            fetchOptionState,
            onClickBox,
            commaFormatter,
            fetchTableData,
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
