<template>
    <widget-layout ref="widgetRef" class="daily-updates" overflow="auto">
        <template #title>
            <div class="top">
                <p class="title">
                    {{ $t('COMMON.WIDGETS.DAILY_UPDATE_TITLE') }}
                </p>
                <p class="time">
                    {{ $t('COMMON.WIDGETS.DAILY_UPDATE_DESC') }}
                </p>
            </div>
        </template>
        <template #default>
            <div v-if="loading" class="overflow-hidden">
                <div v-for="v in skeletons" :key="v" class="flex p-4 items-center">
                    <p-skeleton width="2rem" height="2rem" class="mr-4 flex-shrink-0" />
                    <div class="grid grid-cols-1 gap-1 w-full">
                        <p-skeleton width="80%" height="0.625rem" />
                        <p-skeleton width="100%" height="0.625rem" />
                    </div>
                </div>
            </div>

            <div v-else-if="data.length === 0 && alertData.length === 0"
                 class="w-full h-full flex items-center"
            >
                <div class="no-data-wrapper">
                    <img class="no-data-img" src="@/assets/images/illust_spaceship_3.svg">
                    <p class="no-data-text">
                        {{ $t('COMMON.WIDGETS.DAILY_UPDATE_NO_DATA') }}
                    </p>
                </div>
            </div>

            <div v-else class="card-wrapper">
                <div v-if="alertData.length > 0" class="daily-update-card-alert">
                    <div v-for="(item, index) in alertData" :key="index"
                         class="daily-update-card"
                    >
                        <div>
                            <p-lazy-img :src="assetUrlConverter(item.icon)"
                                        width="2rem" height="2rem"
                                        class="rounded flex-shrink-0 service-img"
                            />
                        </div>
                        <p v-if="item.created_count || item.deleted_count" class="daily-service">
                            {{ item.title }}<br> <span class="font-bold text-sm">{{ item.total_count || 0 }}</span>
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
                    <div>
                        <p-lazy-img :src="assetUrlConverter(item.icon)"
                                    width="2rem" height="2rem"
                                    class="rounded flex-shrink-0 service-img"
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
        </template>
    </widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { find, range } from 'lodash';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs, UnwrapRef,
} from '@vue/composition-api';
import { PLazyImg, PSkeleton, PI } from '@spaceone/design-system';

import WidgetLayout from '@/common/components/WidgetLayout.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { store } from '@/store';
import { INVENTORY_ROUTE } from '@/routes/inventory/inventory-route';

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
    cloud_service_group: string;
    cloud_service_type: string;
    total_count: number;
    icon: string;
    provider: string;
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
    skeletons: number[];
}

const getCreatedAtFilters = () => `filters=created_at:=${dayjs().format('YYYY-MM-DD')}`;
const getDeletedAtFilters = () => `filters=deleted_at:=${dayjs().format('YYYY-MM-DD')}&filters=state:=DELETED`;

export default {
    name: 'DailyUpdates',
    components: {
        WidgetLayout,
        PLazyImg,
        PI,
        PSkeleton,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state: UnwrapRef<State> = reactive({
            serverData: [],
            cloudServiceData: [],
            data: [],
            alertData: [],
            loading: true,
            widgetRef: null,
            dailyUpdates: false,
            skeletons: range(4),
        });

        const serverAPI = SpaceConnector.client.statistics.topic.dailyUpdateServer;

        const getServerData = async (): Promise<void> => {
            try {
                const params: any = {
                    timezone: store.state.user.timezone,
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
                    timezone: store.state.user.timezone,
                };
                if (props.projectId) params.project_id = props.projectId;
                const res = await cloudServiceAPI(params);
                state.cloudServiceData = res.results;
            } catch (e) {
                console.error(e);
            }
        };

        const queryHelper = new QueryHelper();

        const setProjectDashboardData = async () => {
            state.data = [
                ...state.serverData.map(d => ({
                    title: d.cloud_service_group,
                    isServer: true,
                    icon: d.icon || props.providers[d.provider]?.icon,
                    createdHref: {
                        name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: d.provider,
                            group: d.cloud_service_group,
                            name: d.cloud_service_type,
                        },
                        query: {
                            filters: queryHelper.setFilters([
                                // { k: 'provider', v: d.provider, o: '=' },
                                { k: 'project_id', v: props.projectId, o: '=' },
                                { k: 'created_at', v: dayjs().format('YYYY-MM-DD'), o: '=t' },
                            ]).rawQueryStrings,
                        },
                    },
                    deletedHref: {
                        name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: d.provider,
                            group: d.cloud_service_group,
                            name: d.cloud_service_type,
                        },
                        query: {
                            filters: queryHelper.setFilters([
                                // { k: 'provider', v: d.provider, o: '=' },
                                { k: 'project_id', v: props.projectId, o: '=' },
                                { k: 'deleted_at', v: dayjs().format('YYYY-MM-DD'), o: '=t' },
                                { k: 'state', v: 'DELETED', o: '=' },
                            ]).rawQueryStrings,
                        },
                    },
                    ...d,
                })),
                ...state.cloudServiceData.map(d => ({
                    title: d.cloud_service_group,
                    icon: d.icon || props.providers[d.provider]?.icon,
                    createdHref: {
                        name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: d.provider,
                            group: d.cloud_service_group,
                            name: d.cloud_service_type,
                        },
                        query: {
                            filters: queryHelper.setFilters([
                                { k: 'project_id', v: props.projectId, o: '=' },
                                { k: 'created_at', v: dayjs().format('YYYY-MM-DD'), o: '=t' },
                            ]).rawQueryStrings,
                        },
                    },
                    deletedHref: {
                        name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: d.provider,
                            group: d.cloud_service_group,
                            name: d.cloud_service_type,
                        },
                        query: {
                            filters: queryHelper.setFilters([
                                { k: 'project_id', v: props.projectId, o: '=' },
                                { k: 'deleted_at', v: dayjs().format('YYYY-MM-DD'), o: '=t' },
                                { k: 'state', v: 'DELETED', o: '=' },
                            ]).rawQueryStrings,
                        },
                    },
                    ...d,
                })),
            ];
            return state.data;
        };

        const setDashboardData = async () => {
            state.data = [
                ...state.serverData.map(d => ({
                    title: d.cloud_service_group,
                    isServer: true,
                    icon: d.icon || props.providers[d.provider]?.icon,
                    createdHref: {
                        name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: d.provider,
                            group: d.cloud_service_group,
                            name: d.cloud_service_type,
                        },
                        query: {
                            filters: queryHelper.setFilters([
                                // { k: 'provider', v: d.provider, o: '=' },
                                { k: 'created_at', v: dayjs().format('YYYY-MM-DD'), o: '=t' },
                            ]).rawQueryStrings,
                        },
                    },
                    deletedHref: {
                        name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: d.provider,
                            group: d.cloud_service_group,
                            name: d.cloud_service_type,
                        },
                        query: {
                            filters: queryHelper.setFilters([
                                // { k: 'provider', v: d.provider, o: '=' },
                                { k: 'deleted_at', v: dayjs().format('YYYY-MM-DD'), o: '=t' },
                                { k: 'state', v: 'DELETED', o: '=' },
                            ]).rawQueryStrings,
                        },
                    },
                    ...d,
                })),
                ...state.cloudServiceData.map(d => ({
                    title: d.cloud_service_group,
                    icon: d.icon || props.providers[d.provider]?.icon,
                    createdHref: {
                        name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: d.provider,
                            group: d.cloud_service_group,
                            name: d.cloud_service_type,
                        },
                        query: {
                            filters: queryHelper.setFilters([
                                { k: 'created_at', v: dayjs().format('YYYY-MM-DD'), o: '=t' },
                            ]).rawQueryStrings,
                        },
                    },
                    deletedHref: {
                        name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: d.provider,
                            group: d.cloud_service_group,
                            name: d.cloud_service_type,
                        },
                        query: {
                            filters: queryHelper.setFilters([
                                { k: 'deleted_at', v: dayjs().format('YYYY-MM-DD'), o: '=t' },
                                { k: 'state', v: 'DELETED', o: '=' },
                            ]).rawQueryStrings,
                        },
                    },
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
            await Promise.all([getServerData(), getCloudServiceData()]);
            if (props.projectId) {
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
            getCreatedAtFilters,
            getDeletedAtFilters,
            assetUrlConverter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.daily-updates {
    @apply bg-white;
    &::v-deep {
        .widget-contents {
            @apply h-full;
            padding: 0;
        }
        .item-container.card {
            background-color: transparent;
        }
        .p-lazy-img .img-container {
            @apply rounded;
        }
    }
    min-height: 25rem;
    max-height: 35rem;
}

@screen lg {
    .daily-updates::v-deep {
        &.p-pane-layout {
            background-color: rgba(theme('colors.white'));
        }
        .title {
            @apply text-sm leading-normal;
        }
    }
}

.top {
    @apply pb-4;
    .title {
        @apply text-gray-900;
        font-size: 1rem;
        line-height: 1.2;
        font-weight: bold;
        .desc {
            @apply text-gray-700;
            font-size: 0.75rem;
            line-height: 1.2;
            font-weight: normal;
        }
    }
    .time {
        @apply text-gray-500;
        margin-top: 0.375rem;
        font-size: 0.625rem;
        line-height: 1;
    }
}

.managed-resources {
    @apply text-gray-700;
    font-size: 0.75rem;
    line-height: 1.2;
    margin-top: -0.5rem;
}

.no-data-wrapper {
    @apply w-full;
    height: 12.5rem;
    text-align: center;
    .no-data-img {
        @apply h-full w-full;
    }
    .no-data-text {
        @apply mb-0 text-center text-primary2;
        margin-top: -2.25rem;
        font-weight: bold;
        font-size: 0.875rem;
        line-height: 1.6;
        opacity: 0.7;
    }
}

.card-wrapper {
    @apply overflow-hidden whitespace-no-wrap w-full;
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
                @apply bg-blue-100 cursor-pointer underline text-blue-500;
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
                @apply bg-blue-100 cursor-pointer underline text-red-500;
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
