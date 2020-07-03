<template>
    <p-widget-layout ref="widgetRef" class="daily-updates" title="Daily Updates"
                     :help="$t('DASHBOARD.ACTION.DAILY_UPDATES')"
    >
        <template #default>
            <div v-if="loading" class="flex items-center overflow-hidden">
                <p-skeleton width="2rem" height="2rem" class="mr-4" />
                <div class="grid grid-cols-1 gap-1 w-full">
                    <p-skeleton width="80%" height="0.625rem" />
                    <p-skeleton width="100%" height="0.625rem" />
                </div>
            </div>
            <div v-else-if="data.length === 0" class="h-full flex flex-col justify-center">
                <img :src="'./images/illust_no-update.svg'" class="no-data-img">
            </div>
            <p-grid-layout v-else :items="data"
                           row-gap="0.5rem" column-gap="0"
                           :fix-column="1" card-height="auto"
                           card-min-width="0"
                           :card-class="() => []"
            >
                <template #card="{item, index}">
                    <router-link :to="item.href">
                        <p-selectable-item :icon-url="item.icon" :default-icon="item.defaultIcon" theme="card">
                            <template #contents>
                                <div v-tooltip.bottom.start="{content: item.group, delay: {show: 500}}" class="group">
                                    {{ item.group }}
                                </div>
                                <div v-tooltip.bottom.start="{content: item.type, delay: {show: 500}}" class="type">
                                    {{ item.type }}
                                </div>
                            </template>
                            <template #extra>
                                <div class="inline-flex items-center">
                                    <p-i :name="getIcon(item.count)" height="0.75rem" width="0.75rem" />
                                    <span class="count">{{ Math.abs(item.count) }}</span>
                                </div>
                            </template>
                        </p-selectable-item>
                    </router-link>
                </template>
            </p-grid-layout>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PSelectableList from '@/components/organisms/lists/selectable-list/SelectableList.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import PSelectableItem from '@/components/molecules/selectable-item/SelectableItem.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton.vue';
import { fluentApi } from '@/lib/fluent-api';
import { ProviderStoreType, useStore } from '@/store/toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { HistoryDiff } from '@/lib/fluent-api/statistics/history';


interface CloudService {
    // eslint-disable-next-line camelcase
    cloud_service_group: string;
    // eslint-disable-next-line camelcase
    cloud_service_type: string;
    // eslint-disable-next-line camelcase
    cloud_service_count: number;
    provider: string;
    icon: string;
}

interface Server {
    // eslint-disable-next-line camelcase
    server_type: string;
    // eslint-disable-next-line camelcase
    server_count: number;
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

interface Props {
    getServerAction: (api: HistoryDiff<Server>) => HistoryDiff<Server>;
    getCloudServiceAction: (api: HistoryDiff<CloudService>) => HistoryDiff<CloudService>;
    projectFilter: string;
}

interface State {
    serverData: Server[];
    cloudServiceData: CloudService[];
    data: Data[];
    loading: boolean;
    widgetRef: any;
}

export default {
    name: 'DailyUpdates',
    components: {
        PWidgetLayout,
        PI,
        PGridLayout,
        PSelectableItem,
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
    setup(props: Props) {
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
        });


        const serverApi = fluentApi.statisticsTest().history().diff<Server>()
        // .setTopic('daily_server_updates')

            .setFrom('now/d')
            .setDefaultFields('server_type')
            .setDiffFields('server_count');

        const getServerData = async (): Promise<void> => {
            try {
                const res = await props.getServerAction(serverApi).execute();
                state.serverData = res.data.results;
            } catch (e) {
                console.error(e);
            }
        };

        const cloudServiceApi = fluentApi.statisticsTest().history().diff<CloudService>()
            // .setTopic('daily_cloud_service_updates')
            .setFrom('now/d')
            .setDefaultFields('cloud_service_type', 'cloud_service_group', 'provider', 'icon')
            .setDiffFields('cloud_service_count');

        const getCloudServiceData = async (): Promise<void> => {
            try {
                const res = await props.getCloudServiceAction(cloudServiceApi).execute();
                state.cloudServiceData = res.data.results;
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
                        count: d.server_count,
                        defaultIcon: 'ic_server',
                        isServer: true,
                        href: `/inventory/server?&f=server_type%3A${d.server_type}${props.projectFilter}`,
                    })),
                    ...state.cloudServiceData.map(d => ({
                        group: d.cloud_service_group,
                        type: d.cloud_service_type,
                        count: d.cloud_service_count,
                        provider: d.provider,
                        icon: d.icon || providerStore.state.providers[d.provider]?.icon,
                        href: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${props.projectFilter}`,
                    })),
                ];
            } else {
                state.data = [
                    ...state.serverData.map(d => ({
                        group: 'Server',
                        type: d.server_type,
                        count: d.server_count,
                        defaultIcon: 'ic_server',
                        isServer: true,
                        href: `/inventory/server?&f=server_type%3A${d.server_type}`,
                    })),
                    ...state.cloudServiceData.map(d => ({
                        group: d.cloud_service_group,
                        type: d.cloud_service_type,
                        count: d.cloud_service_count,
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
            // onItemClick(item) {
            //     // console.log('item test', item);
            //     const path = item.isServer ? `/inventory/server?&f=server_type%3A${item.type}` : `/inventory/cloud-service/${item.provider}/${item.group}/${item.type}/?`;
            //     if (props.projectFilter) {
            //         vm.$router.push({
            //             path: `${path}${props.projectFilter}`,
            //         });
            //     } else {
            //         vm.$router.push({
            //             path: `${path}`,
            //         });
            //     }
            // },
            getIcon(count: number): string {
                if (count > 0) return 'ic_list_increase';
                if (count < 0) return 'ic_list_decrease';
                return '';
            },
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

.group {
    @apply text-base font-bold mb-1 truncate leading-tight;
}
.type {
    @apply text-xs text-gray truncate leading-tight;
}
.count {
    @apply text-lg font-bold ml-1;
}
.no-data-img {
    @apply mx-auto mb-4 flex-shrink-0;
    max-width: 14rem;
}
</style>
