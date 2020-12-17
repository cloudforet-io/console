<template>
    <widget-layout class="cloud-services-widget">
        <template #title>
            <div class="top">
                <p class="title">
                    {{ $t('COMMON.WIDGETS.CLOUD_SERVICE_TITLE') }}
                </p>
                <div class="help">
                    <p-i v-if="projectId"
                         v-tooltip.top="$t('COMMON.WIDGETS.CLOUD_SERVICE_HELP')"
                         name="ic_tooltip" width="1rem"
                         height="1rem"
                         class="icon"
                         color="inherit transparent"
                    />
                </div>
                <router-link v-if="moreInfo" to="/inventory/cloud-service" class="more">
                    <span class="text-xs">{{ $t('COMMON.WIDGETS.CLOUD_SERVICE_SEE_MORE') }}</span>
                    <p-i name="ic_arrow_right" width="1rem" height="1rem"
                         color="inherit transparent"
                    />
                </router-link>
            </div>
        </template>
        <template #default>
            <div class="card-wrapper grid gap-2 grid-cols-1
                        sm:grid-cols-2 md:grid-cols-4"
            >
                <template v-if="loading">
                    <div v-for="v in skeletons" :key="v" class="flex items-center p-4">
                        <p-skeleton width="2rem" height="2rem" class="mr-4" />
                        <div class="grid grid-cols-1 gap-1 w-full">
                            <p-skeleton width="80%" height="0.625rem" />
                            <p-skeleton width="100%" height="0.625rem" />
                        </div>
                    </div>
                </template>
                <router-link v-else-if="data.length === 0" to="/plugin/collector"
                             class="no-data rounded-sm flex items-center justify-center
                              border border-gray-200 border-solid bg-transparent text-gray-900 hover:border-secondary hover:text-secondary "
                >
                    <p-i name="ic_plus_square" width="1rem" height="1rem"
                         class="mr-2" color="inherit white"
                    />
                    {{ $t('COMMON.WIDGETS.CLOUD_SERVICE_CREATE_COLLECTOR') }}
                </router-link>
                <template v-else>
                    <router-link v-for="(item, index) in data" :key="index" :to="item.href">
                        <p-selectable-item
                            :icon-url="iconUrl(item)" theme="card" class="card"
                        >
                            <template #contents>
                                <div class="group-name">
                                    {{ item.group }}
                                </div>
                                <div class="name">
                                    {{ item.name }}
                                </div>
                            </template>
                            <template #extra>
                                <span class="count">{{ item.count || 0 }}</span>
                            </template>
                        </p-selectable-item>
                    </router-link>
                </template>
            </div>
        </template>
        <template #extra />
    </widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { range } from 'lodash';

import { reactive, toRefs } from '@vue/composition-api';
import { Location } from 'vue-router';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PSelectableItem from '@/components/molecules/selectable-item/PSelectableItem.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { QueryHelper } from '@/lib/query';

const DATA_LENGTH = 8;
export default {
    name: 'CloudServices',
    components: {
        WidgetLayout,
        PSelectableItem,
        PSkeleton,
        PI,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
        projectFilter: {
            type: String,
            default: '',
        },
        moreInfo: {
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        interface Value {
            provider: string;
            group: string;
            icon: string;
            name: string;
            count: number;
            href: [string, object];
        }

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
        });

        const queryHelper = new QueryHelper();

        const getLink = (data, projectId?) => {
            let link;
            if (data.resource_type === 'inventory.Server' && !projectId) {
                link = {
                    name: 'server',
                    query: {
                        filters: queryHelper.setFilters([
                            { k: 'provider', v: data.provider, o: '=' },
                            { k: 'cloud_service_type', v: data.cloud_service_type, o: '=' },
                        ]).rawQueryStrings,
                    },
                };
            }
            if (data.resource_type === 'inventory.Server' && projectId) {
                link = {
                    name: 'server',
                    query: {
                        filters: queryHelper.setFilters([
                            { k: 'project_id', v: projectId, o: '=' },
                            { k: 'provider', v: data.provider, o: '=' },
                            { k: 'cloud_service_type', v: data.cloud_service_type, o: '=' },
                        ]).rawQueryStrings,
                    },
                };
            }
            if (data.resource_type === 'inventory.CloudService' && !projectId) {
                link = {
                    name: 'cloudServicePage',
                    params: {
                        provider: data.provider,
                        group: data.cloud_service_group,
                        name: data.cloud_service_type,
                    },
                };
            }
            if (data.resource_type === 'inventory.CloudService' && projectId) {
                link = {
                    name: 'cloudServicePage',
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
            projectApiQuery.setSort('count', true, 'name')
                .setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]);
            const res = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                query: projectApiQuery.data,
                is_primary: true,
            });

            state.data = [
                ...res.results.map(d => ({
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
            apiQuery.setSort('count', true, 'name')
                .setPage(1, 9);
            try {
                if (props.projectFilter) {
                    await getDataInProject();
                } else {
                    const res = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                        query: apiQuery.data,
                        is_primary: true,
                    });
                    state.data = [
                        ...res.results.splice(0, DATA_LENGTH).map(d => ({
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
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        getData();

        return {
            ...toRefs(state),
            iconUrl: (item: Value): string => item.icon || props.providers[item.provider]?.icon || '',
        };
    },
};
</script>

<style lang="postcss" scoped>
.widget-layout::v-deep {
    .item-container.card .contents {
        padding: 1rem 1rem 1rem 0.75rem;
    }
}
.top {
    @apply mb-3 flex w-full items-center;
    .title {
        @apply flex-shrink-0;
        font-size: 1.125rem;
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
        @apply flex-shrink-0 text-sm text-blue-600 font-normal inline-flex items-center cursor-pointer;
        justify-self: flex-end;
        font-size: 0.75rem;
        &:hover {
            @apply text-secondary underline;
        }
    }
}

.card {
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
    @apply text-blue-500 font-normal float-right inline-flex items-center cursor-pointer;
    font-size: 0.75rem;
    &:hover {
        @apply text-secondary underline;
    }
}
.no-data {
    height: 3.5rem;
}
</style>
