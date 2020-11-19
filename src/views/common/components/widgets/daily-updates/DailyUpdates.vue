<template>
    <p-widget-layout ref="widgetRef" class="daily-updates" :title="$t('COMMON.WIDGETS.DAILY_UPDATE_TITLE')"
                     :sub-title="$t('COMMON.WIDGETS.DAILY_UPDATE_DESC')"
    >
        <template #extra>
            <span class="managed-resources">(Managed Resources)</span>
        </template>
        <template #default>
            <div v-if="loading" class="mr-10 flex items-center overflow-hidden">
                <p-skeleton width="2rem" height="2rem" class="mx-10" />
                <div class="grid grid-cols-1 gap-1 w-full">
                    <p-skeleton width="80%" height="0.625rem" />
                    <p-skeleton width="100%" height="0.625rem" />
                </div>
            </div>
            <div v-if="!loading" class="card-wrapper">
                <div v-if="alertData.length > 0" class="daily-update-card-alert">
                    <div v-for="(item, index) in alertData" :key="index"
                         class="daily-update-card"
                    >
                        <div v-if="!item.isServer">
                            <p-lazy-img :src="iconUrl(item)"
                                        width="2rem" height="2rem"
                                        class="rounded flex-shrink-0 service-img"
                            />
                        </div>
                        <div v-else-if="item.isServer">
                            <p-i name="ic_server"
                                 width="2rem" height="2rem"
                                 class="rounded flex-shrink-0"
                            />
                        </div>
                        <p v-if="item.created_count || item.deleted_count" class="daily-service">
                            {{ item.title }}<br> <span class="text-sm">{{ item.total_count || 0 }}</span>
                        </p>
                        <router-link v-if="item.created_count" :to="item.createdHref" class="daily-created-count">
                            {{ $t('COMMON.WIDGETS.DAILY_UPDATE_CREATED') }}  <br>
                            <span class="text-blue-500 font-bold text-sm">{{ item.created_count || 0 }}
                                <p-i v-if="item.create_warning" name="ic_state_duplicated" width="0.75rem"
                                     height="0.75rem"
                                />
                            </span>
                        </router-link>
                        <router-link v-if="item.deleted_count" :to="item.deletedHref" class="daily-deleted-count">
                            {{ $t('COMMON.WIDGETS.DAILY_UPDATE_DELETED') }} <br>
                            <span class="text-red-500 font-bold text-sm"> {{ item.deleted_count || 0 }}
                                <p-i v-if="item.delete_warning" name="ic_state_duplicated" width="0.75rem"
                                     height="0.75rem"
                                />
                            </span>
                        </router-link>
                    </div>
                </div>
                <div v-for="(item, index) in data" :key="index" class="daily-update-card">
                    <div v-if="!item.isServer">
                        <p-lazy-img :src="iconUrl(item)"
                                    width="2rem" height="2rem"
                                    class="rounded flex-shrink-0 service-img"
                        />
                    </div>
                    <div v-else-if="item.isServer">
                        <p-i name="ic_server"
                             width="2rem" height="2rem"
                             class="rounded flex-shrink-0"
                        />
                    </div>
                    <p v-if="item.created_count || item.deleted_count" class="daily-service">
                        {{ item.title }}<br> <span class="text-sm font-bold">{{ item.total_count || 0 }}</span>
                    </p>
                    <router-link v-if="item.created_count" :to="item.createdHref" class="daily-created-count">
                        {{ $t('COMMON.WIDGETS.DAILY_UPDATE_CREATED') }}  <br>
                        <span class="text-blue-500 font-bold text-sm">{{ item.created_count || 0 }}</span>
                    </router-link>
                    <router-link v-if="item.deleted_count" :to="item.deletedHref" class="daily-deleted-count">
                        {{ $t('COMMON.WIDGETS.DAILY_UPDATE_DELETED') }} <br>
                        <span class="text-red-500 font-bold text-sm"> {{ item.deleted_count || 0 }}</span>
                    </router-link>
                </div>
            </div>
            <div v-if="!loading && ( data.length === 0 && alertData.length === 0) " class="h-full flex flex-col justify-center">
                <img :src="'./images/illust_no-update.svg'" class="no-data-img">
            </div>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { reactive, toRefs, UnwrapRef } from '@vue/composition-api';

import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { store } from '@/store';
import { getTimezone } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { find } from 'lodash';

dayjs.extend(utc);
dayjs.extend(timezone);


interface CloudService {
    cloud_service_group: string;
    cloud_service_type: string;
    total_count: number;
    provider: string;
    icon: string;
    created_count: number;
    deleted_count: number;
    create_warning: boolean;
    delete_warning: boolean;
}

interface Server {
    server_type: string;
    total_count: number;
    created_count: number;
    deleted_count: number;
    create_warning: boolean;
    delete_warning: boolean;
}

interface Data {
    group: string;
    type: string;
    isServer?: boolean;
    count: number;
    icon?: string;
    provider?: string;
    defaultIcon?: string;
    create_warning?: boolean;
    delete_warning?: boolean;
}

interface State {
    serverData: Server[];
    cloudServiceData: CloudService[];
    data: any;
    loading: boolean;
    widgetRef: any;
    dailyUpdates: boolean;
    alertData: any;
}

const getCreatedAtFilters = () => `filters=created_at:=${dayjs().format('YYYY-MM-DD')}`;
const getDeletedAtFilters = () => `filters=deleted_at:=${dayjs().format('YYYY-MM-DD')}&filters=state:=DELETED`;

export default {
    name: 'DailyUpdates',
    components: {
        PWidgetLayout,
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
            alertData: [],
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
                if (props.projectId) params.project_id = props.projectId;
                const res = await cloudServiceAPI(params);
                state.cloudServiceData = res.results;
            } catch (e) {
                console.error(e);
            }
        };

        const setProjectDashboardData = async () => {
            state.data = [
                ...state.serverData.map(d => ({
                    title: d.server_type,
                    isServer: true,
                    href: `/inventory/server?&filters=server_type%3A${d.server_type}${props.projectFilter}`,
                    createdHref: `/inventory/server?filters=server_type%3A${d.server_type}${props.projectFilter}&${getCreatedAtFilters()}`,
                    deletedHref: `/inventory/server?filters=server_type%3A${d.server_type}${props.projectFilter}&${getDeletedAtFilters()}`,
                    ...d,
                })),
                ...state.cloudServiceData.map(d => ({
                    title: d.cloud_service_group,
                    icon: d.icon || store.state.resource.provider.items[d.provider]?.icon,
                    href: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${props.projectFilter}`,
                    createdHref: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${props.projectFilter}&${getCreatedAtFilters()}`,
                    deletedHref: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${props.projectFilter}&${getDeletedAtFilters()}`,
                    ...d,
                })),
            ];
            return state.data;
        };

        const setDashboardData = async () => {
            state.data = [
                ...state.serverData.map(d => ({
                    title: d.server_type,
                    isServer: true,
                    href: `/inventory/server?&filters=server_type%3A${d.server_type}`,
                    createdHref: `/inventory/server?&filters=server_type%3A${d.server_type}&${getCreatedAtFilters()}`,
                    deletedHref: `/inventory/server?&filters=server_type%3A${d.server_type}&${getDeletedAtFilters()}`,
                    ...d,
                })),
                ...state.cloudServiceData.map(d => ({
                    title: d.cloud_service_group,
                    icon: d.icon || store.state.resource.provider.items[d.provider]?.icon,
                    href: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?`,
                    createdHref: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${getCreatedAtFilters()}`,
                    deletedHref: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}/?${getDeletedAtFilters()}`,
                    ...d,
                })),
            ];
            return state.data;
        };

        const getAlertData = (dataForFilter) => {
            const alertData = [] as any[];
            find(dataForFilter, (d) => {
                if (d.create_warning || d.delete_warning) {
                    alertData.push(d);
                }
            });
            state.alertData = alertData;
            state.data = state.data.filter(x => !state.alertData.includes(x));
        };


        const getData = async (): Promise<void> => {
            state.loading = true;
            await Promise.all([store.dispatch('resource/provider/load'), getServerData(), getCloudServiceData()]);
            if (props.projectFilter) {
                const dataForFilter = await setProjectDashboardData() as any[];
                await getAlertData(dataForFilter);
            } else {
                const dataForFilter = await setDashboardData() as any[];
                await getAlertData(dataForFilter);
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
        .p-lazy-img .img-container {
            @apply rounded;
        }
    }
    min-height: 37rem;
    max-height: 47rem;
    overflow-y: scroll;
}

@screen lg {
    .daily-updates::v-deep {
        &.p-pane-layout {
            background-color: rgba(theme('colors.white'), 0.8);
        }
        .title {
            @apply text-sm leading-normal;
        }
    }
}

.managed-resources {
    @apply text-gray-700;
    font-size: 0.75rem;
    line-height: 1.2;
    margin-top: -0.5rem;
}

.no-data-img {
    @apply mx-auto mb-4 flex-shrink-0;
    max-width: 14rem;
}

.card-wrapper {
    @apply overflow-hidden whitespace-no-wrap w-full px-4;
    .daily-update-card {
        @apply flex items-center w-full content-between overflow-hidden;
        padding-left: 1rem;
        height: 4rem;
        border-radius: 0.25rem;

        .daily-service {
            @apply text-xs truncate flex-shrink-0;
            margin-left: 0.75rem;
            width: 24%;
            max-width: 6.5rem;
            padding: 0.5rem;

            @media screen and (1024px < width < 1280px) {
                margin-left: 0;
            }
        }
        .daily-created-count {
            @apply text-xs flex-shrink-0;
            padding: 0.5rem;
            margin-right: 0.75rem;
            width: 24%;
            max-width: 6.5rem;
            &:hover {
                @apply bg-white cursor-pointer underline text-blue-500;
                opacity: 0.75;
                border-radius: 0.25rem;
            }
        }
        .daily-deleted-count {
            @apply text-xs flex-shrink-0;
            padding: 0.5rem;
            margin-right: 0.75rem;
            width: 24%;
            max-width: 6.5rem;
            &:hover {
                @apply bg-white cursor-pointer underline text-red-500;
                opacity: 0.75;
                border-radius: 0.25rem;
            }
        }
        .p-i-icon, .service-img {
            @apply rounded;

            @media screen and (1024px < width < 1280px) {
                display: none;
            }
        }
        &:nth-of-type(odd) {
            background-color: rgba(theme('colors.primary4'), 0.5);
        }
    }
}

.card-wrapper .daily-update-card-alert {
    @apply flex items-center w-full content-between border;
    flex-wrap: wrap;
    border-radius: 0.25rem;
    overflow: hidden;
    border-color: rgba(theme('colors.yellow.500'), 0.75);
    background: linear-gradient(90deg, rgba(theme('colors.yellow.100'), 0.75) 23.96%, rgba(theme('colors.yellow.300'), 0.75) 49.48%, rgba(theme('colors.yellow.100'), 0.75) 74.48%);
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;

    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }
        100% {
            background-position: 100% 50%;
        }
    }

    .daily-update-card {
        background-color: rgba(theme('colors.yellow.100'), 0.75);
    }
}
</style>
