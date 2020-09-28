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
            <div v-if="!loading && data.length === 0" class="h-full flex flex-col justify-center">
                <img :src="'./images/illust_no-update.svg'" class="no-data-img">
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
                                <p-lazy-img :src="iconUrl(item)"
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
                                <div class="top">
                                    <span v-tooltip.bottom="{content: item.group, delay: {show: 500}}" class="group">{{ item.group }}</span>
                                    <span class="count">({{ item.count || 0 }})</span>
                                    <span v-tooltip.bottom="{content: item.type, delay: {show: 500}}" class="type">{{ item.type }}</span>
                                </div>
                                <p v-if="item.created_count && item.deleted_count" class="state">
                                    <router-link :to="item.createdHref">
                                        Created <span class="created-count">{{ item.created_count || 0 }}</span>
                                    </router-link>
                                    <span class="divider">|</span>
                                    <router-link :to="item.deletedHref">
                                        Deleted <span class="deleted-count">{{ item.deleted_count || 0 }}</span>
                                    </router-link>
                                </p>
                                <p v-else-if="item.created_count && !item.deleted_count" class="state">
                                    <router-link :to="item.createdHref">
                                        Created <span class="created-count">{{ item.created_count || 0 }}</span>
                                    </router-link>
                                </p>
                                <p v-else class="state">
                                    <router-link :to="item.deletedHref">
                                        Deleted <span class="deleted-count">{{ item.deleted_count || 0 }}</span>
                                    </router-link>
                                </p>
                            </div>
                        </div>
                    </router-link>
                </template>
            </p-grid-layout>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
import { reactive, toRefs, UnwrapRef } from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/PGridLayout.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { store } from '@/store';
import { getTimezone } from '@/lib/util';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { SpaceConnector } from '@/lib/space-connector';

dayjs.extend(utc);
dayjs.extend(timezone);

    interface CloudService {
        // eslint-disable-next-line camelcase
        cloud_service_group: string;
        // eslint-disable-next-line camelcase
        cloud_service_type: string;
        // eslint-disable-next-line camelcase
        total_count: number;
        provider: string;
        icon: string;
        // eslint-disable-next-line camelcase
        created_count: number;
        // eslint-disable-next-line camelcase
        deleted_count: number;
    }

    interface Server {
        // eslint-disable-next-line camelcase
        server_type: string;
        // eslint-disable-next-line camelcase
        total_count: number;
        // eslint-disable-next-line camelcase
        created_count: number;
        // eslint-disable-next-line camelcase
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

const getCreatedAtFilters = () => `filters=created_at:=${dayjs().format('YYYY-MM-DD')}`;
const getDeletedAtFilters = () => `filters=deleted_at:=${dayjs().format('YYYY-MM-DD')}&filters=state:=DELETED`;

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
        projectFilter: {
            type: String,
            default: '',
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state: UnwrapRef<State> = reactive({
            serverData: [],
            cloudServiceData: [],
            data: [],
            loading: true,
            widgetRef: null,
            dailyUpdates: false,
        });

        const serverAPI = SpaceConnector.client.statistics.topic.dailyUpdateServer;

        const getServerData = async (): Promise<void> => {
            try {
                const params: any = {
                    timezone: getTimezone(),
                };
                    // eslint-disable-next-line camelcase
                if (props.projectId) params.project_id = props.projectId;
                const res = await serverAPI(params);
                state.serverData = res.results;
            } catch (e) {
                console.error(e);
            }
        };

        const cloudServiceAPI = SpaceConnector.client.statistics.topic.dailyUpdateCloudService;

        const getCloudServiceData = async (): Promise<void> => {
            try {
                const params: any = {
                    timezone: getTimezone(),
                };
                    // eslint-disable-next-line camelcase
                if (props.projectId) params.project_id = props.projectId;
                const res = await cloudServiceAPI(params);
                state.cloudServiceData = res.results;
            } catch (e) {
                console.error(e);
            }
        };


        const getData = async (): Promise<void> => {
            state.loading = true;
            await Promise.all([store.dispatch('resource/provider/load'), getServerData(), getCloudServiceData()]);
            if (props.projectFilter) {
                state.data = [
                    ...state.serverData.map(d => ({
                        group: 'Server',
                        type: d.server_type,
                        count: d.total_count,
                        isServer: true,
                        // eslint-disable-next-line camelcase
                        created_count: d.created_count,
                        // eslint-disable-next-line camelcase
                        deleted_count: d.deleted_count,
                        href: `/inventory/server?&filters=server_type%3A${d.server_type}${props.projectFilter}`,
                        createdHref: `/inventory/server?filters=server_type%3A${d.server_type}${props.projectFilter}&${getCreatedAtFilters()}`,
                        deletedHref: `/inventory/server?filters=server_type%3A${d.server_type}${props.projectFilter}&${getDeletedAtFilters()}`,
                    })),
                    ...state.cloudServiceData.map(d => ({
                        group: d.cloud_service_group,
                        type: d.cloud_service_type,
                        count: d.total_count,
                        provider: d.provider,
                        // eslint-disable-next-line camelcase
                        created_count: d.created_count,
                        // eslint-disable-next-line camelcase
                        deleted_count: d.deleted_count,
                        icon: d.icon || store.state.resource.provider.items[d.provider]?.icon,
                        href: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${props.projectFilter}`,
                        createdHref: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${props.projectFilter}&${getCreatedAtFilters()}`,
                        deletedHref: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${props.projectFilter}&${getDeletedAtFilters()}`,
                    })),
                ];
            } else {
                state.data = [
                    ...state.serverData.map(d => ({
                        group: 'Server',
                        type: d.server_type,
                        count: d.total_count,
                        isServer: true,
                        // eslint-disable-next-line camelcase
                        created_count: d.created_count,
                        // eslint-disable-next-line camelcase
                        deleted_count: d.deleted_count,
                        href: `/inventory/server?&filters=server_type%3A${d.server_type}`,
                        createdHref: `/inventory/server?&filters=server_type%3A${d.server_type}&${getCreatedAtFilters()}`,
                        deletedHref: `/inventory/server?&filters=server_type%3A${d.server_type}&${getDeletedAtFilters()}`,
                    })),
                    ...state.cloudServiceData.map(d => ({
                        group: d.cloud_service_group,
                        type: d.cloud_service_type,
                        count: d.total_count,
                        // eslint-disable-next-line camelcase
                        created_count: d.created_count,
                        // eslint-disable-next-line camelcase
                        deleted_count: d.deleted_count,
                        provider: d.provider,
                        icon: d.icon || store.state.resource.provider.items[d.provider]?.icon,
                        href: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?`,
                        createdHref: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${getCreatedAtFilters()}`,
                        deletedHref: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${getDeletedAtFilters()}`,
                    })),
                ];
            }
            state.loading = false;
        };


        getData();

        return {
            ...toRefs(state),
            iconUrl: (item): string => item.icon || store.state.resource.provider.items[item.provider]?.icon || '',
            getCreatedAtFilters,
            getDeletedAtFilters,
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
        .daily-updates::v-deep {
            &.p-pane-layout {
                background-color: rgba(theme('colors.white'), 0.8);
            }
            .title {
                @apply text-sm leading-normal -mt-2;
            }
            .help {
                @apply -mt-2;
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
            .top {
                width: 100%;
                display: flex;
            }
            .group {
                @apply font-bold pr-1;
            }
            .count {
                @apply font-bold;
            }
            .type {
                @apply truncate text-xs font-light text-gray-500 pl-2;
                max-width: 80px;
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
