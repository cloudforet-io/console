<template>
    <widget-layout class="cloud-services-widget"
                   overflow="auto"
    >
        <template #title>
            <div class="top">
                <p class="title">
                    {{ $t('COMMON.WIDGETS.CLOUD_SERVICE.TITLE') }}
                </p>
                <div class="help">
                    <p-i v-if="projectId"
                         v-tooltip.top="$t('COMMON.WIDGETS.CLOUD_SERVICE.HELP')"
                         name="ic_tooltip"
                         width="1rem"
                         height="1rem"
                         class="icon"
                         color="inherit transparent"
                    />
                </div>
                <router-link v-if="moreInfo"
                             :to="cloudServiceTypeLink"
                             class="more"
                >
                    <span class="text-xs">{{ $t('COMMON.WIDGETS.CLOUD_SERVICE.SEE_MORE') }}</span>
                    <p-i name="ic_arrow_right"
                         width="1rem"
                         height="1rem"
                         color="inherit transparent"
                    />
                </router-link>
            </div>
        </template>
        <template #default>
            <p-data-loader
                :loading="loading"
                :data="data"
            >
                <template #loader>
                    <div class="card-wrapper">
                        <div v-for="v in skeletons"
                             :key="v"
                             class="flex items-center p-4"
                        >
                            <p-skeleton width="2rem"
                                        height="2rem"
                                        class="mr-4"
                            />
                            <div class="loading-wrapper">
                                <p-skeleton width="80%"
                                            height="0.625rem"
                                />
                                <p-skeleton width="100%"
                                            height="0.625rem"
                                />
                            </div>
                        </div>
                    </div>
                </template>
                <div class="card-wrapper">
                    <router-link v-for="(item, index) in data"
                                 :key="index"
                                 :to="item.href"
                    >
                        <div class="card">
                            <div class="content-wrapper">
                                <p-lazy-img :src="iconUrl(item)"
                                            width="2rem"
                                            height="2rem"
                                            class="icon"
                                />
                                <div class="content">
                                    <div class="group-name">
                                        {{ item.group }}
                                    </div>
                                    <div class="name">
                                        {{ item.name }}
                                    </div>
                                </div>
                            </div>
                            <div class="extra">
                                <span class="count">{{ item.count || 0 }}</span>
                            </div>
                        </div>
                    </router-link>
                </div>
                <template #no-data>
                    <div class="no-data-wrapper">
                        <p-empty
                            show-image
                            :title="$t('COMMON.WIDGETS.CLOUD_SERVICE.NO_DATA')"
                        >
                            <template #image>
                                <img src="@/assets/images/illust_circle_boy.svg"
                                     alt="empty-image"
                                >
                            </template>
                        </p-empty>
                    </div>
                </template>
            </p-data-loader>
        </template>
    </widget-layout>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import {
    PSkeleton, PI, PLazyImg, PEmpty, PDataLoader,
} from '@spaceone/design-system';
import { range } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

interface Value {
    provider: string;
    group: string;
    icon: string;
    name: string;
    count: number;
    href: [string, object];
}
const DATA_LENGTH = 8;

export default {
    name: 'CloudServices',
    components: {
        WidgetLayout,
        PSkeleton,
        PI,
        PLazyImg,
        PEmpty,
        PDataLoader,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
        moreInfo: {
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const queryHelper = new QueryHelper();

        const state = reactive({
            loading: true,
            skeletons: range(8),
            data: [] as Array<{
                count: number;
                group: string;
                icon: string;
                name: string;
                provider: string;
                href: string;
            }>,
            cloudServiceTypeLink: computed(() => {
                const filters: ConsoleFilter[] = [];
                if (props.projectId) filters.push({ k: 'project_id', o: '=', v: props.projectId });
                return {
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                    query: {
                        filters: queryHelper.setFilters(filters).rawQueryStrings,
                    },
                };
            }),
        });

        const getLink = (data, projectId?) => {
            let link;
            if (!projectId) {
                link = {
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                    params: {
                        provider: data.provider,
                        group: data.cloud_service_group,
                        name: data.cloud_service_type,
                    },
                };
            }
            if (projectId) {
                link = {
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                    params: {
                        provider: data.provider,
                        group: data.cloud_service_group,
                        name: data.cloud_service_type,
                    },
                    query: {
                        filters: queryHelper.setFilters([
                            { k: 'project_id', v: projectId, o: '=' },
                        ]).rawQueryStrings,
                    },
                };
            }
            return link;
        };
        const projectApiQuery = new ApiQueryHelper();
        const getDataInProject = async () => {
            projectApiQuery.setSort('count', true)
                .setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]);
            const res = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                query: projectApiQuery.data,
                is_primary: true,
            });

            state.data = [
                ...res.results.map((d) => ({
                    count: d.count,
                    group: d.cloud_service_group,
                    icon: d.icon,
                    name: d.cloud_service_type,
                    type: d.resource_type,
                    provider: d.provider,
                    href: getLink(d, props.projectId),
                })),
            ];
        };

        const apiQuery = new ApiQueryHelper();
        const getData = async (): Promise<void> => {
            state.loading = true;
            apiQuery.setSort('count', true)
                .setPage(1, 9);
            try {
                if (props.projectId) {
                    await getDataInProject();
                } else {
                    const res = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                        query: apiQuery.data,
                        is_primary: true,
                    });
                    state.data = [
                        ...res.results.splice(0, DATA_LENGTH).map((d) => ({
                            count: d.count,
                            group: d.cloud_service_group,
                            icon: d.icon,
                            name: d.cloud_service_type,
                            provider: d.provider,
                            href: getLink(d),
                        })),
                    ];
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.data = [];
            } finally {
                state.loading = false;
            }
        };

        getData();

        return {
            ...toRefs(state),
            iconUrl: (item: Value): string => assetUrlConverter(item.icon) || props.providers[item.provider]?.icon || '',
        };
    },
};
</script>

<style lang="postcss" scoped>
.card-wrapper {
    @apply grid gap-2 grid-cols-1;

    @screen sm {
        @apply grid-cols-2;
    }

    @screen md {
        @apply grid-cols-4;
    }

    @screen lg {
        @apply grid-cols-1;
    }

    .card {
        display: flex;
        justify-content: space-between;
        &:hover {
            @apply bg-blue-100;
        }
        .content-wrapper {
            display: flex;
            align-items: center;
            .icon {
                @apply flex-shrink-0;
                margin-right: 0.5rem;
            }
        }
    }

    .loading-wrapper {
        @apply grid grid-cols-1 gap-1 w-full;
    }
}

.item-container.card .contents {
    padding: 1rem 1rem 1rem 0.75rem;
}
.top {
    @apply mb-3 flex w-full items-center;
    .title {
        @apply flex-shrink-0;
        line-height: 1.2;
        font-weight: bold;
    }
    .help {
        @apply ml-2 flex-shrink-0 flex-grow text-gray-400;
        .icon {
            cursor: help;
        }
    }
    .more {
        @apply flex-shrink-0 text-sm text-blue-700 font-normal inline-flex items-center cursor-pointer;
        justify-self: flex-end;
        font-size: 0.75rem;
        &:hover {
            @apply text-secondary underline;
        }
    }
}

.card {
    @apply border border-gray-200 rounded;
    display: flex;
    margin-bottom: 0.5rem;
    padding: 0.5rem 1rem;
    .group-name {
        @apply font-bold mb-1 truncate leading-tight;
        font-size: 0.875rem;
    }
    .name {
        @apply text-xs text-gray truncate leading-tight;
        text-decoration: none;
    }
    .count {
        @apply ml-1;
        font-size: 0.875rem;
    }
    &:hover {
        @apply underline;
    }
}
.more {
    @apply text-blue-600 font-normal float-right inline-flex items-center cursor-pointer;
    font-size: 0.75rem;
    &:hover {
        @apply text-secondary underline;
    }
}
.no-data-wrapper {
    @apply flex w-full h-full flex-col justify-center items-center;
    padding-top: 4.75rem;
    padding-bottom: 6.125rem;
}

</style>
