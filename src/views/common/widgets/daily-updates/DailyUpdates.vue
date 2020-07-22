<template>
    <p-widget-layout ref="widgetRef" class="daily-updates" title="Daily Updates"
                     sub-title="00:00 ~ present (Local time)"
                     :help="$t('DASHBOARD.ACTION.DAILY_UPDATES')"
    >
        <template #default>
            <div v-if="loading" class="mr-10 flex items-center overflow-hidden">
                <p-skeleton width="2rem" height="2rem" class="mx-10" />
                <div class="grid grid-cols-1 gap-1 w-full">
                    <p-skeleton width="80%" height="0.625rem" />
                    <p-skeleton width="100%" height="0.625rem" />
                </div>
            </div>
            <p-grid-layout :items="data"
                           row-gap="0" column-gap="0"
                           :fix-column="1" card-height="auto"
                           card-min-width="0"
                           :card-class="() => []"
            >
                <template #card="{item, index}">
                    <router-link :to="item.href">
                        <hr v-if="item.created_count || item.deleted_count" style="width: 100%;">
                        <div v-if="item.created_count || item.deleted_count" class="card-contents">
                            <div v-if="!item.isServer">
                                <p-lazy-img :img-url="iconUrl(item)"
                                            width="2rem" height="2rem"
                                            class="mr-2"
                                />
                            </div>
                            <div v-else-if="item.isServer">
                                <p-i name="ic_server"
                                     width="2rem" height="2rem"
                                     class="mr-2 rounded-sm"
                                />
                            </div>
                            <div class="daily-update-contents">
                                <div class="group">
                                    {{ item.group }} <span>({{ item.count || 0 }})</span>
                                    <span class="type">{{ item.type }}</span>
                                </div>
                                <p v-if="item.created_count && item.deleted_count" class="state">
                                    Created <span class="created-count">{{ item.created_count || 0 }}</span>
                                    <span class="divider">|</span>
                                    Deleted <span class="deleted-count">{{ item.deleted_count || 0 }}</span>
                                </p>
                                <p v-else-if="item.created_count && !item.deleted_count" class="state">
                                    Created <span class="created-count">{{ item.created_count || 0 }}</span>
                                </p>
                                <p v-else class="state">
                                    Deleted <span class="deleted-count">{{ item.deleted_count || 0 }}</span>
                                </p>
                            </div>
                        </div>
                    </router-link>
                </template>
            </p-grid-layout>
            <div v-if="serverData.length === 0 && cloudServiceData.length === 0" class="h-full flex flex-col justify-center">
                <img :src="'./images/illust_no-update.svg'" class="no-data-img">
            </div>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
import { getCurrentInstance, reactive, toRefs } from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/PGridLayout.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import { ProviderStoreType, useStore } from '@/store/toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';


    interface CloudService {
        // eslint-disable-next-line camelcase
        cloud_service_group: string;
        // eslint-disable-next-line camelcase
        cloud_service_type: string;
        // eslint-disable-next-line camelcase
        cloud_service_count: number;
        provider: string;
        icon: string;
        created_count: number;
        deleted_count: number;
    }

    interface Server {
        // eslint-disable-next-line camelcase
        server_type: string;
        // eslint-disable-next-line camelcase
        total_count: number;
        created_count: number;
        deleted_count: number;
    }

    interface Data {
        group: string;
        type: string;
        isServer?: boolean;
        count: number;
        icon?: string;
        provider?: string;
        defaultIcon?: string;
    }

    interface State {
        serverData: Server[];
        cloudServiceData: CloudService[];
        data: Data[];
        loading: boolean;
        widgetRef: any;
        dailyUpdates: boolean;
    }

export default {
    name: 'DailyUpdates',
    components: {
        PWidgetLayout,
        PGridLayout,
        PLazyImg,
        PI,
        PSkeleton,
    },
    props: {
        getServerAction: {
            type: Function,
            default: api => api,
        },
        getCloudServiceAction: {
            type: Function,
            default: api => api,
        },
        projectFilter: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm: any = getCurrentInstance();

        const {
            provider,
        } = useStore();
        const providerStore: ProviderStoreType = provider;


        const state: UnwrapRef<State> = reactive({
            serverData: [],
            cloudServiceData: [],
            data: [],
            loading: true,
            widgetRef: null,
            dailyUpdates: false,
        });

        const serverAPI = fluentApi.statisticsTest().resource().stat()
            .setResourceType('inventory.Server')
            .addGroupKey('server_type', 'server_type')
            .addGroupField('total_count', STAT_OPERATORS.count)
            .setFilter({ key: 'server_type', value: ['BAREMETAL', 'VM', 'HYPERVISOR'], operator: FILTER_OPERATOR.in })

            .setJoinResourceType('inventory.Server')
            .setJoinType('OUTER')
            .addJoinKey('server_type')
            .addJoinGroupKey('server_type', 'server_type')
            .addJoinGroupField('deleted_count', STAT_OPERATORS.count)
            .setJoinFilter([{ key: 'server_type', value: ['BAREMETAL', 'VM', 'HYPERVISOR'], operator: FILTER_OPERATOR.in },
                { key: 'deleted_at', value: 'now/d', operator: FILTER_OPERATOR.gtTime },
                { key: 'state', value: 'DELETED', operator: FILTER_OPERATOR.in }])

            .setJoinResourceType('inventory.Server', 1)
            .setJoinType('OUTER', 1)
            .addJoinKey('server_type', 1)
            .addJoinGroupKey('server_type', 'server_type', 1)
            .addJoinGroupField('created_count', STAT_OPERATORS.count, 'created_count', 1)
            .setJoinFilter([{ key: 'server_type', value: ['BAREMETAL', 'VM', 'HYPERVISOR'], operator: FILTER_OPERATOR.in },
                { key: 'created_at', value: 'now/d', operator: FILTER_OPERATOR.gtTime }], 1);

        const getServerData = async (): Promise<void> => {
            try {
                const res = await props.getServerAction(serverAPI).execute();
                const filteredData = res.data.results.filter(element => (element.created_count > 0 || element.deleted_count > 0));
                state.serverData = filteredData;
            } catch (e) {
                console.error(e);
            }
        };

        const cloudServiceAPI = fluentApi.statisticsTest().resource().stat()
            .setFilter({ key: 'tags.spaceone:is_major', value: 'true', operator: FILTER_OPERATOR.in })
            .setResourceType('inventory.CloudServiceType')
            .setGroupKeys({ key: 'name', name: 'cloud_service_type' }, { key: 'group', name: 'cloud_service_group' },
                { name: 'provider', key: 'provider' }, { name: 'icon', key: 'tags.spaceone:icon' })

            .setJoinKeys(['cloud_service_type', 'cloud_service_group', 'provider'])
            .setJoinResourceType('inventory.CloudService')
            .addJoinGroupKey('cloud_service_type', 'cloud_service_type')
            .addJoinGroupKey('cloud_service_group', 'cloud_service_group')
            .addJoinGroupKey('provider', 'provider')
            .addJoinGroupField('cloud_service_count', STAT_OPERATORS.count)

            .setJoinKeys(['cloud_service_type', 'cloud_service_group', 'provider'], 1)
            .setJoinResourceType('inventory.CloudService', 1)
            .addJoinGroupKey('cloud_service_type', 'cloud_service_type', 1)
            .addJoinGroupKey('cloud_service_group', 'cloud_service_group', 1)
            .addJoinGroupKey('provider', 'provider', 1)
            .addJoinGroupField('deleted_count', STAT_OPERATORS.count, 'deleted_count', 1)
            .setJoinFilter([{ key: 'deleted_at', value: 'now/d', operator: FILTER_OPERATOR.gtTime },
                { key: 'state', value: 'DELETED', operator: FILTER_OPERATOR.in }], 1)

            .setJoinKeys(['cloud_service_type', 'cloud_service_group', 'provider'], 2)
            .setJoinResourceType('inventory.CloudService', 2)
            .addJoinGroupKey('cloud_service_type', 'cloud_service_type', 2)
            .addJoinGroupKey('cloud_service_group', 'cloud_service_group', 2)
            .addJoinGroupKey('provider', 'provider', 2)
            .addJoinGroupField('created_count', STAT_OPERATORS.count, 'created_count', 2)
            .setJoinFilter([{ key: 'created_at', value: 'now/d', operator: FILTER_OPERATOR.gtTime }], 2);


        const getCloudServiceData = async (): Promise<void> => {
            try {
                const res = await props.getCloudServiceAction(cloudServiceAPI).execute();
                const filteredData = res.data.results.filter(element => (element.created_count > 0 || element.deleted_count > 0));
                state.cloudServiceData = filteredData;
            } catch (e) {
                console.error(e);
            }
        };


        const getData = async (): Promise<void> => {
            state.loading = true;
            state.data = [];
            await providerStore.getProvider();
            await Promise.all([getServerData(), getCloudServiceData()]);
            if (props.projectFilter) {
                state.data = [
                    ...state.serverData.map(d => ({
                        group: 'Server',
                        type: d.server_type,
                        count: d.total_count,
                        isServer: true,
                        created_count: d.created_count,
                        deleted_count: d.deleted_count,
                        href: `/inventory/server?&f=server_type%3A${d.server_type}${props.projectFilter}`,
                    })),
                    ...state.cloudServiceData.map(d => ({
                        group: d.cloud_service_group,
                        type: d.cloud_service_type,
                        count: d.cloud_service_count,
                        provider: d.provider,
                        created_count: d.created_count,
                        deleted_count: d.deleted_count,
                        icon: d.icon || providerStore.state.providers[d.provider]?.icon,
                        href: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${props.projectFilter}`,
                    })),
                ];
            } else {
                state.data = [
                    ...state.serverData.map(d => ({
                        group: 'Server',
                        type: d.server_type,
                        count: d.total_count,
                        isServer: true,
                        created_count: d.created_count,
                        deleted_count: d.deleted_count,
                        href: `/inventory/server?&f=server_type%3A${d.server_type}`,
                    })),
                    ...state.cloudServiceData.map(d => ({
                        group: d.cloud_service_group,
                        type: d.cloud_service_type,
                        count: d.cloud_service_count,
                        created_count: d.created_count,
                        deleted_count: d.deleted_count,
                        provider: d.provider,
                        icon: d.icon || providerStore.state.providers[d.provider]?.icon,
                        href: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?`,
                    })),
                ];
            }
            state.loading = false;
        };

        getData();

        return {
            ...toRefs(state),
            iconUrl: (item): string => item.icon || providerStore.state.providers[item.provider]?.icon || '',
        };
    },
};
</script>

<style lang="postcss" scoped>
    .daily-updates {
        @apply bg-white;
        &::v-deep {
            .widget-contents {
                overflow-y: auto;
                padding: 0;
            }
            .item-container.card {
                background-color: transparent;
            }
        }
    }

    @screen lg {
        .daily-updates {
            background-color: rgba(theme('colors.white'), 0.8);
        &::v-deep {
                .title {
                    @apply text-sm leading-normal;
                }
                .top {
                    @apply mt-6;
                }
            }
        }
    }

    .no-data-img {
        @apply mx-auto mb-4 flex-shrink-0;
        max-width: 14rem;
    }
    .card-contents {
        @apply flex items-center w-full content-between p-4 overflow-hidden;
        &:hover {
             background-color: rgba(theme('colors.blue.200'), 0.8);
         }
        .daily-update-contents {
            @apply overflow-hidden text-sm whitespace-no-wrap;
            line-height: 150%;
            .group {
                @apply pr-1 font-bold;
                .type {
                    @apply truncate text-xs font-light text-gray-500 pl-2;
                    max-width: 80px;
                }
            }
            .state {
                @apply text-xs;
                line-height: 120%;
            }
            .created-count {
                @apply text-green-500 text-xs font-bold pl-1;
                line-height: 120%;
            }
            .deleted-count {
                @apply text-gray-500 text-xs font-bold pl-1;
                line-height: 120%;
            }
            .divider {
                @apply pl-3 pr-2 text-xs text-gray-300;
                line-height: 120%;
            }
        }

    }
</style>
