<template>
    <div class="spot-group-detail-dashboard-monitoring">
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
            <keep-alive>
                <template v-if="selectedIndex < 2">
                    <monitoring v-if="resources.length > 0"
                                :loading="loading"
                                :resources="resources"
                                :data-source-id="dataSourceId"
                                :resource-type="resourceType"
                                :selected-metrics="metrics"
                    />
                </template>
                <template v-else>
                    <p-dynamic-layout type="table"
                                      class="resource-table"
                                      :data="instanceState.data"
                                      :options="instanceState.schema.options"
                                      :fetch-options="fetchOptionState"
                                      :type-options="{ excelVisible: false }"
                                      @fetch="fetchTableData"
                    />
                </template>
            </keep-alive>
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
import {
    DynamicLayoutEventListener,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import Monitoring from '@/services/monitoring/modules/monitoring/Monitoring.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';


enum SCHEMA_TYPE {
    INSTANCE = 'INSTANCE',
    LOAD_BALANCER = 'LOAD_BALANCER',
}
enum METRIC_TYPE {
    CPU = 'CPU',
    DISK = 'DISK',
}

export default {
    name: 'SpotGroupDetailDashboardMonitoring',
    components: {
        Monitoring,
        PI,
        PLottie,
        PDynamicLayout,
    },
    props: {
        spotGroupId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        /* util */
        const numberFormatter = (num) => {
            if (Math.abs(num) < 10000) {
                return Math.round(num * 100) / 100;
            }
            const options = { notation: 'compact', signDisplay: 'auto', maximumFractionDigits: 1 };
            return Intl.NumberFormat('en', options).format(num);
        };
        const commaFormatter = (num) => {
            if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return num;
        };

        /* state */
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const metricsCacheMap = {};
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
            loading: false,
            cloudServiceId: '',
            resourceType: 'inventory.Server',
            resources: [],
            selectedIndex: 0,
            schemaType: '' as keyof typeof SCHEMA_TYPE,
            metricType: METRIC_TYPE.CPU as keyof typeof METRIC_TYPE,
            metrics: [] as string[],
            dataSourceId: '',
            instanceCpuUsage: 0,
            instanceDiskUsage: 0,
            loadBalancerCount: 0,
            dataList: computed(() => ([
                {
                    type: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.INSTANCE'),
                    detail: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.CPU_USAGE_RAGE'),
                    count: commaFormatter(numberFormatter(state.instanceCpuUsage)),
                    suffix: '%',
                },
                {
                    type: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.INSTANCE'),
                    detail: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MONITORING.DISK_USAGE_RATE'),
                    count: Math.floor(state.instanceDiskUsage),
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

        /* api */
        const getInstanceCpuUsage = async (spotGroupId) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceCpu({
                    spot_groups: [spotGroupId],
                });
                state.instanceCpuUsage = get(res, `spot_groups.${spotGroupId}.cpu_utilization`);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const getInstanceDiskUsage = async (spotGroupId) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceDisk({
                    spot_groups: [spotGroupId],
                });
                state.instanceDiskUsage = get(res, `spot_groups.${spotGroupId}.total_iops`);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const getInstanceState = async (spotGroupId) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceState({
                    spot_groups: [spotGroupId],
                });
                instanceState.count = get(res, `spot_groups.${spotGroupId}.total`);
                instanceState.unhealthyCount = get(res, `spot_groups.${spotGroupId}.unhealthy`);
                instanceState.status = get(res, `spot_groups.${spotGroupId}.state`);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const getLoadBalancerCount = async (spotGroupId) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupLoadbalancerCount({
                    spot_groups: [spotGroupId],
                });
                state.loadBalancerCount = get(res, `spot_groups.${spotGroupId}`);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const getSpotGroupServers = async (spotGroupId) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupServers({
                    spot_group_id: spotGroupId,
                });
                state.resources = res.results.map(d => ({ id: d.server_id, name: d.name }));
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const getSpotGroupMetrics = async (spotGroupId) => {
            try {
                state.loading = true;
                let metrics = metricsCacheMap[state.metricType];
                let dataSourceId = state.dataSourceId;

                if (!metrics || !dataSourceId) {
                    const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupMetrics({
                        spot_group_id: spotGroupId,
                        metric_type: state.metricType,
                    });
                    metrics = res.metrics;
                    dataSourceId = res.data_source_id;
                }
                metricsCacheMap[state.metricType] = metrics;
                state.metrics = metrics || [];
                state.dataSourceId = dataSourceId;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };
        const getInstanceSchema = async (spotGroupId) => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupSchema({
                    spot_group_id: spotGroupId,
                    schema_type: state.schemaType,
                });
                state.cloudServiceId = res.cloud_service_id;
                instanceState.schema = res.schema;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const getInstanceQuery = () => {
            apiQuery
                .setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilters([{ v: fetchOptionState.searchText }]);
            return apiQuery.data;
        };
        const getInstance = async (spotGroupId) => {
            await getInstanceSchema(spotGroupId);

            try {
                const res = await SpaceConnector.client.inventory.cloudService.getData({
                    cloud_service_id: state.cloudServiceId,
                    query: getInstanceQuery(),
                    key_path: get(instanceState.schema, 'options.root_path'),
                });
                instanceState.data = res.results;
            } catch (e) {
                ErrorHandler.handleError(e);
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
        const fetchTableData: DynamicLayoutEventListener['fetch'] = (changed) => {
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
            getInstance(props.spotGroupId);
        };

        watch(() => props.spotGroupId, (spotGroupId) => {
            getInstanceCpuUsage(spotGroupId);
            getInstanceDiskUsage(spotGroupId);
            getInstanceState(spotGroupId);
            getLoadBalancerCount(spotGroupId);

            getSpotGroupServers(spotGroupId);
            getSpotGroupMetrics(spotGroupId);
        }, { immediate: false });

        watch(() => state.metricType, () => {
            getSpotGroupMetrics(props.spotGroupId);
        }, { immediate: false });

        watch(() => state.schemaType, () => {
            getInstance(props.spotGroupId);
        }, { immediate: false });

        return {
            ...toRefs(state),
            instanceState,
            fetchOptionState,
            onClickBox,
            fetchTableData,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-detail-dashboard-monitoring {
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
            @apply border border-gray-200 rounded-lg;
            position: relative;
            display: flex;
            height: 7.25rem;
            cursor: pointer;
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
