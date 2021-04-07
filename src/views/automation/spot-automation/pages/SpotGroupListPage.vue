<template>
    <section class="spot-group-list-wrapper">
        <p-breadcrumbs :routes="routeState.route" />
        <section class="page-title">
            <p-page-title :title="$t('AUTOMATION.SPOT_AUTOMATION.MAIN.SPOT_GROUP')" use-total-count :total-count="totalCount" />
            <router-link :to="{ name: 'addSpotGroup' }">
                <p-icon-text-button style-type="primary-dark" outline name="ic_plus_bold"
                                    class="add-spot-group-btn"
                >
                    {{ $t('AUTOMATION.SPOT_AUTOMATION.SPOT_GROUP_LIST.ADD_SPOT_GROUP') }}
                </p-icon-text-button>
            </router-link>
        </section>
        <p-divider class="spot-group-divider" />
        <p-toolbox filters-visible
                   search-type="query"
                   :page-size.sync="pageSize"
                   :total-count="totalCount"
                   :query-tags="tags"
                   :key-item-sets="keyItemSets"
                   :value-handler-map="valueHandlerMap"
                   @change="onChange"
                   @refresh="onChange"
        />
        <p-data-loader class="flex-grow" :data="items" :loading="loading"
                       :class="{'short': isShort}"
        >
            <div class="card-wrapper" :class="{'short': isShort}">
                <div v-for="item in items" :key="item.spot_group_id" class="spot-group-card">
                    <router-link :to="{ name: 'spotGroupDetail',params: {id: item.spot_group_id}}">
                        <spot-group-card v-if="!loading"
                                         :card-data="item"
                                         :is-short="isShort"
                        />
                    </router-link>
                </div>
            </div>
        </p-data-loader>
    </section>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import {
    PBreadcrumbs, PPageTitle, PDivider, PToolbox, PIconTextButton, PDataLoader,
} from '@spaceone/design-system';
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { QueryHelper } from '@/lib/query';
import { timestampFormatter } from '@/lib/util';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { getPageStart, getThisPage } from '@/lib/component-utils/pagination';
import SpotGroupCard from '@/views/automation/spot-automation/modules/spot-group-card/SpotGroupCard.vue';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { store } from '@/store';
import { Tags, TimeStamp } from '@/models';

dayjs.extend(timezone);

// TODO: change handlers with spot automation spec
const handlers = makeQuerySearchPropsWithSearchSchema(
    [{
        title: 'Filters',
        items: [
            { key: 'cloud_service_id', name: 'Cloud Service ID', reference: 'inventory.CloudService' },
            { key: 'provider', name: 'Provider', reference: 'identity.Provider' },
            { key: 'project_id', name: 'Project', reference: 'identity.Project' },
        ],
    }],
    'inventory.CloudService',
);

interface Options {
    min_ondemand_ratio: number;
    recommend_types: string;
}

interface Reference {
    external_link: string;
    resource_id: string;
}

interface CardData {
    cloud_service_group: string;
    cloud_service_type: string;
    created_at: TimeStamp;
    created_by: string;
    instanceCount: object;
    instanceCpu: number;
    instanceDisk: number;
    name: string;
    options: Options;
    project_id: string;
    provider: string;
    reference: Reference;
    region_code: string;
    resource_id: string;
    resource_type: string;
    spot_group_id: string;
    tags: Tags;
}

interface InstanceCountType {
    total: number;
    ondemand: number;
    spot: number;
}
interface InstanceCpuType {
    cpu_utilization: number;
}
interface InstanceDiskType {
    write_iops: number;
    read_iops: number;
    total_iops: number;
}

interface InstanceRes<T> {
    spot_groups: Record<string, T>[];
}
export default {
    name: 'SpotGroupPage',
    components: {
        SpotGroupCard,
        PBreadcrumbs,
        PPageTitle,
        PDivider,
        PToolbox,
        PIconTextButton,
        PDataLoader,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const apiQuery = new ApiQueryHelper();

        const state = reactive({
            items: undefined as unknown as CardData[],
            loading: true,
            keyItemSets: handlers.keyItemSets,
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
            thisPage: 1,
            pageSize: 24,
            sortBy: null,
            sortDesc: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone),
            isShort: true,
        });
        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.SPOT_AUTOMATION') },
            ]),
        });

        const getQuery = () => {
            apiQuery.setPageStart(getPageStart(state.thisPage, state.pageSize))
                .setPageLimit(state.pageSize)
                .setFilters(queryHelper.filters);

            return apiQuery.data;
        };


        const getSpotGroupInstanceCount = async (spotGroupIds) => {
            try {
                const instanceResponse: InstanceRes<InstanceCountType> = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceCount({
                    // eslint-disable-next-line camelcase
                    spot_groups: spotGroupIds,
                });
                Object.keys(state.items).forEach((i) => {
                    const instanceCount = instanceResponse.spot_groups[state.items[i].spot_group_id] as unknown as InstanceCountType;
                    state.items[i].instanceCount = instanceCount;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const getSpotGroupCpuInfo = async (spotGroupIds) => {
            try {
                const CpuResponse: InstanceRes<InstanceCpuType> = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceCpu({
                    // eslint-disable-next-line camelcase
                    spot_groups: spotGroupIds,
                });
                Object.keys(state.items).forEach((i) => {
                    const instanceCpu = CpuResponse.spot_groups[state.items[i].spot_group_id] as unknown as InstanceCpuType;
                    state.items[i].instanceCpu = Math.round(instanceCpu.cpu_utilization * 100) / 100;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const getSpotGroupDiskInfo = async (spotGroupIds) => {
            try {
                const DiskResponse: InstanceRes<InstanceDiskType> = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceDisk({
                    // eslint-disable-next-line camelcase
                    spot_groups: spotGroupIds,
                });
                Object.keys(state.items).forEach((i) => {
                    const instanceDisk = DiskResponse.spot_groups[state.items[i].spot_group_id] as unknown as InstanceDiskType;
                    state.items[i].instanceDisk = Math.round(instanceDisk.total_iops * 100) / 100;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const listSpotGroup = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.list({ query: getQuery() });
                state.items = res.results.map(d => ({
                    ...d,
                    created_at: timestampFormatter(d.created_at, state.timezone),
                }));
                state.totalCount = res.total_count || 0;
                const spotGroupIds = res.results.map(item => item.spot_group_id) || [];
                await Promise.all([getSpotGroupInstanceCount(spotGroupIds),
                    getSpotGroupCpuInfo(spotGroupIds),
                    getSpotGroupDiskInfo(spotGroupIds),
                ]);
                state.loading = false;
            } catch (e) {
                console.error(e);
            }
        };

        const changeQueryString = async (options) => {
            queryHelper.setFiltersAsQueryTag(options.queryTags);
            await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
        };

        const onChange = async (options: any) => {
            if (options.queryTags !== undefined) {
                state.tags = options.queryTags;
                await changeQueryString(options);
            }
            if (options.pageLimit !== undefined) {
                state.pageSize = options.pageLimit;
            }
            if (options.pageStart !== undefined) {
                state.thisPage = getThisPage(options.pageStart, state.pageSize);
            }
            await listSpotGroup();
        };
        (async () => {
            await listSpotGroup();
        })();


        return {
            ...toRefs(state),
            routeState,
            onChange,
            timestampFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-list-wrapper {
    padding: 2rem 1.5rem;
}
.page-title {
    display: flex;
    justify-content: space-between;
}

.spot-group-divider {
    @apply w-full;
    margin-bottom: 1.5rem;
}
.card-wrapper {
    &.short {
        @apply grid;
        grid-template-columns: repeat(auto-fit, minmax(259px, 1fr));
        row-gap: 1rem;
        column-gap: 1.5rem;

        @screen md {
            grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
        }

        @screen lg {
            grid-template-columns: repeat(auto-fit, minmax(700px, 1fr));
        }
    }
}
</style>
