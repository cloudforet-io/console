<template>
    <widget-layout class="daily-updates"
                   overflow="auto"
    >
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
            <div v-if="loading"
                 class="overflow-hidden"
            >
                <div v-for="v in skeletons"
                     :key="v"
                     class="flex p-4 items-center"
                >
                    <p-skeleton width="2rem"
                                height="2rem"
                                class="mr-4 flex-shrink-0"
                    />
                    <div class="grid grid-cols-1 gap-1 w-full">
                        <p-skeleton width="80%"
                                    height="0.625rem"
                        />
                        <p-skeleton width="100%"
                                    height="0.625rem"
                        />
                    </div>
                </div>
            </div>
            <p-data-loader
                v-else
                :loading="false"
                :data="data"
                class="card-wrapper"
            >
                <template #no-data>
                    <p-empty
                        v-if="warningData.length === 0"
                        show-image
                        image-size="md"
                        :title="$t('COMMON.WIDGETS.DAILY_UPDATE_NO_DATA')"
                    >
                        <template #image>
                            <img alt="empty-image"
                                 src="@/assets/images/illust_spaceship_3.svg"
                            >
                        </template>
                    </p-empty>
                </template>

                <div v-if="warningData.length > 0"
                     class="daily-update-card-alert"
                >
                    <div v-for="(item, index) in warningData"
                         :key="index"
                         class="daily-update-card"
                    >
                        <div>
                            <p-lazy-img :src="assetUrlConverter(item.icon)"
                                        width="2rem"
                                        height="2rem"
                                        class="rounded flex-shrink-0 service-img"
                            />
                        </div>
                        <p v-if="item.createdCount || item.deletedCount"
                           class="daily-service"
                        >
                            {{ item.title }}<br> <span class="font-bold text-sm">{{ item.totalCount || 0 }}</span>
                        </p>
                        <router-link v-if="item.createdCount"
                                     :to="item.createdHref"
                                     class="daily-created-count"
                        >
                            {{ $t('COMMON.WIDGETS.DAILY_UPDATE_CREATED') }}  <br>
                            <span class="text-blue-600 font-bold text-sm">{{ item.createdCount || 0 }}
                                <p-i v-if="item.isCreateWarning"
                                     name="ic_state_duplicated"
                                     width="0.75rem"
                                     height="0.75rem"
                                />
                            </span>
                        </router-link>
                        <router-link v-if="item.deletedCount"
                                     :to="item.deletedHref"
                                     class="daily-deleted-count"
                        >
                            {{ $t('COMMON.WIDGETS.DAILY_UPDATE_DELETED') }} <br>
                            <span class="text-red-500 font-bold text-sm"> {{ item.deletedCount || 0 }}
                                <p-i v-if="item.isDeleteWarning"
                                     name="ic_state_duplicated"
                                     width="0.75rem"
                                     height="0.75rem"
                                />
                            </span>
                        </router-link>
                    </div>
                </div>
                <div v-for="(item, index) in data"
                     :key="index"
                     class="daily-update-card"
                >
                    <div>
                        <p-lazy-img :src="assetUrlConverter(item.icon)"
                                    width="2rem"
                                    height="2rem"
                                    class="rounded flex-shrink-0 service-img"
                        />
                    </div>
                    <p v-if="item.createdCount || item.deletedCount"
                       class="daily-service"
                    >
                        {{ item.title }}<br> <span class="text-sm font-bold">{{ item.totalCount || 0 }}</span>
                    </p>
                    <router-link v-if="item.createdCount"
                                 :to="item.createdHref"
                                 class="daily-created-count"
                    >
                        {{ $t('COMMON.WIDGETS.DAILY_UPDATE_CREATED') }}  <br>
                        <span class="text-blue-600 font-bold text-sm">{{ item.createdCount || 0 }}</span>
                    </router-link>
                    <router-link v-if="item.deletedCount"
                                 :to="item.deletedHref"
                                 class="daily-deleted-count"
                    >
                        {{ $t('COMMON.WIDGETS.DAILY_UPDATE_DELETED') }} <br>
                        <span class="text-red-500 font-bold text-sm"> {{ item.deletedCount || 0 }}</span>
                    </router-link>
                </div>
            </p-data-loader>
        </template>
    </widget-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';
import type { Location } from 'vue-router';

import {
    PLazyImg, PSkeleton, PI, PDataLoader, PEmpty,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { find, range } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

interface CloudServiceData {
    cloud_service_group: string;
    cloud_service_type: string;
    total_count: number;
    icon: string;
    provider: string;
    created_count: number;
    deleted_count: number;
    create_warning: boolean;
    delete_warning: boolean;
    display_name?: string;
}

interface Item {
    title: string;
    isCreateWarning?: boolean;
    isDeleteWarning?: boolean;
    icon?: string;
    totalCount: number;
    createdCount: number;
    deletedCount: number;
    createdHref?: Location;
    deletedHref?: Location;
}

export default {
    name: 'DailyUpdates',
    components: {
        WidgetLayout,
        PLazyImg,
        PI,
        PSkeleton,
        PDataLoader,
        PEmpty,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const queryHelper = new QueryHelper();
        const state = reactive({
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            serverData: [] as CloudServiceData[],
            cloudServiceData: [] as CloudServiceData[],
            data: [] as Item[],
            warningData: [] as Item[],
            loading: true,
            skeletons: range(4),
        });

        /* API */
        const listCloudServiceData = async (): Promise<void> => {
            state.loading = true;
            try {
                const params: any = {
                    timezone: store.state.user.timezone,
                };
                if (props.projectId) params.project_id = props.projectId;
                const { results } = await SpaceConnector.client.statistics.topic.dailyUpdateCloudService(params);
                state.cloudServiceData = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.cloudServiceData = [];
            } finally {
                state.loading = false;
            }
        };

        /* Util */
        const getConvertedCloudServiceData = (rawData: CloudServiceData[]): Item[] => {
            const results: Item[] = [];
            rawData.forEach((d) => {
                const filters: ConsoleFilter[] = [];
                if (props.projectId) {
                    filters.push({ k: 'project_id', v: props.projectId, o: '=' });
                }

                const result: Item = {
                    title: d.display_name ?? d.cloud_service_group,
                    icon: d.icon || state.providers[d.provider]?.icon,
                    isCreateWarning: d.create_warning,
                    isDeleteWarning: d.delete_warning,
                    totalCount: d.total_count,
                    createdCount: d.created_count,
                    deletedCount: d.deleted_count,
                    createdHref: {
                        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: d.provider,
                            group: d.cloud_service_group,
                            name: d.cloud_service_type,
                        },
                        query: {
                            filters: queryHelper.setFilters([
                                ...filters,
                                { k: 'created_at', v: dayjs().format('YYYY-MM-DD'), o: '=t' },
                            ]).rawQueryStrings,
                        },
                    },
                    deletedHref: {
                        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: d.provider,
                            group: d.cloud_service_group,
                            name: d.cloud_service_type,
                        },
                        query: {
                            filters: queryHelper.setFilters([
                                ...filters,
                                { k: 'deleted_at', v: dayjs().format('YYYY-MM-DD'), o: '=t' },
                                { k: 'state', v: 'DELETED', o: '=' },
                            ]).rawQueryStrings,
                        },
                    },
                };
                results.push(result);
            });
            return results;
        };
        const getWarningData = (data: Item[]): Item[] => {
            const warningData: Item[] = [];
            find(data, (d) => {
                if (d.isCreateWarning || d.isDeleteWarning) {
                    warningData.push(d);
                }
            });
            return warningData;
        };

        /* Init */
        const init = async (): Promise<void> => {
            await Promise.allSettled([
                listCloudServiceData(),
                store.dispatch('reference/provider/load'),
            ]);
            const data = getConvertedCloudServiceData(state.cloudServiceData);
            state.warningData = getWarningData(data);
            state.data = data.filter((x) => !state.warningData.includes(x));
        };
        init();

        return {
            ...toRefs(state),
            assetUrlConverter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.daily-updates {
    @apply bg-white;

    /* custom widget-layout */
    :deep(&.widget-contents) {
        padding: 0;
    }

    /* custom design-system component - p-lazy-img */
    :deep(.p-lazy-img .img-container) {
        @apply rounded;
    }

    max-height: 25rem;
}

@screen lg {
    /* custom widget-layout */
    :deep(.daily-updates) {
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

.card-wrapper {
    @apply overflow-hidden whitespace-no-wrap w-full rounded-md;
    height: 100%;
    .daily-update-card {
        @apply flex items-center w-full content-between overflow-hidden;
        padding-left: 1rem;
        height: 4rem;

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
                @apply bg-blue-100 cursor-pointer underline text-blue-600 rounded-md;
                opacity: 0.75;
            }
        }
        .daily-deleted-count {
            @apply text-xs flex-shrink-0;
            padding: 0.5rem;
            margin-right: 0.75rem;
            width: 24%;
            max-width: 6.5rem;
            &:hover {
                @apply bg-blue-100 cursor-pointer underline text-red-500 rounded-md;
                opacity: 0.75;
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
    @apply flex items-center w-full content-between border rounded-md;
    flex-wrap: wrap;
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
