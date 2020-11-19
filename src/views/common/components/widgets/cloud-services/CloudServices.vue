<template>
    <p-widget-layout :title="$t('COMMON.WIDGETS.CLOUD_SERVICE_TITLE')" :help="$t('COMMON.WIDGETS.CLOUD_SERVICE_HELP')">
        <template #default>
            <div class="grid gap-2
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        xl:grid-cols-4
                        2xl:grid-cols-6"
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
                            :icon-url="iconUrl(item)" theme="card"
                        >
                            <template #contents>
                                <div v-tooltip.bottom="{content: item.group, delay: {show: 500}}" class="group-name">
                                    {{ item.group }}
                                </div>
                                <div v-tooltip.bottom="{content: item.name, delay: {show: 500}}" class="name">
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
        <template #extra>
            <div v-if="moreInfo">
                <router-link to="/inventory/cloud-service" class="more">
                    {{ $t('COMMON.WIDGETS.CLOUD_SERVICE_SEE_MORE') }}
                    <p-i name="ic_arrow_right" width="1rem" height="1rem"
                         color="inherit transparent"
                    />
                </router-link>
            </div>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import { range } from 'lodash';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PSelectableItem from '@/components/molecules/selectable-item/PSelectableItem.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { store } from '@/store';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'CloudServices',
    components: {
        PWidgetLayout,
        PSelectableItem,
        PSkeleton,
        PI,
    },
    props: {
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
            data: [] as Array<{
                count: number;
                group: string;
                icon: string;
                name: string;
                provider: string;
                href: string;
            }>,
            loading: true,
            providers: computed(() => store.state.resource.provider.items),
        });

        const getDataInProject = async () => {
            const query = new QueryHelper()
                .setSort('created_at')
                .setFilter({ k: 'project_id', v: props.projectId, o: 'eq' });
            const res = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                query: query.data,
                // eslint-disable-next-line camelcase
                is_primary: true,
            });
            state.data = [
                ...res.results.map(d => ({
                    count: d.count,
                    group: d.cloud_service_group,
                    icon: d.icon,
                    name: d.cloud_service_type,
                    provider: d.provider,
                    href: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}?provider=${d.provider}${props.projectFilter}`,
                })),
            ];
        };

        const getData = async (): Promise<void> => {
            state.loading = true;
            await store.dispatch('resource/provider/load');
            const query = new QueryHelper()
                .setSort('created_at')
                .setPage(1, 9);
            try {
                if (props.projectFilter) {
                    await getDataInProject();
                } else {
                    const res = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                        query: query.data,
                        // eslint-disable-next-line camelcase
                        is_primary: true,
                    });
                    state.data = [
                        ...res.results.map(d => ({
                            count: d.count,
                            group: d.cloud_service_group,
                            icon: d.icon,
                            name: d.cloud_service_type,
                            provider: d.provider,
                            href: {
                                path: `/inventory/cloud-service/${d.provider}/${d.cloud_service_group}/${d.cloud_service_type}`,
                                query: { provider: d.provider },
                            },
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
            skeletons: range(9),
            iconUrl: (item: Value): string => item.icon || state.providers[item.provider]?.icon || '',
            // onSelected(item): void {
            //     if (props.projectFilter) {
            //         vm.$router.push({
            //             path: `/inventory/cloud-service/${item.provider}/${item.group}/${item.name}?provider=${item.provider}${props.projectFilter}`,
            //         });
            //     } else {
            //         vm.$router.push({
            //             path: `/inventory/cloud-service/${item.provider}/${item.group}/${item.name}`,
            //             query: { provider: item.provider },
            //         });
            //     }
            // },
        };
    },
};
</script>

<style lang="postcss" scoped>

.group-name {
    @apply text-base font-bold mb-1 truncate leading-tight;
}
.name {
    @apply text-xs text-gray truncate leading-tight;
}
.count {
    @apply text-lg ml-1;
}
.more {
    @apply text-sm text-blue-600 font-normal float-right inline-flex items-center cursor-pointer;
    &:hover {
        @apply text-secondary underline;
    }
}
.no-data {
    height: 3.5rem;
}
</style>
