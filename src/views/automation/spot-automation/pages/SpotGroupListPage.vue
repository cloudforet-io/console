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
        <p class="cost-instance-info">
            비용, 인스턴스 기간:<strong>이번달</strong>
        </p>
        <p-data-loader class="flex-grow" :data="items" :loading="loading"
                       :class="{'short': isShort}"
        >
            <div class="card-wrapper" :class="{'short': isShort}">
                <div v-for="item in items" :key="item.spot_group_id" class="spot-group-card">
                    <router-link :to="{ name: 'spotGroupDetail',params: {id: item.spot_group_id}}">
                        <spot-group-card
                            :card-data="item"
                            :is-short="isShort"
                            :card-data-loading="cardDataLoading"
                        />
                    </router-link>
                </div>
            </div>
            <template #no-data>
                <section class="no-spot-group">
                    <figure class="no-spot-group-img">
                        <img src="@/assets/images/illust_no-spot-group.svg">
                    </figure>
                    <p class="no-spot-group-text">
                        스팟 자동화를 이용하려면, 스팟그룹을 생성해주세요.
                    </p>
                </section>
            </template>
        </p-data-loader>
    </section>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import {
    PBreadcrumbs, PPageTitle, PDivider, PToolbox, PIconTextButton, PDataLoader, PLottie,
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
    loadbalancerCount: number;
    instanceState: string;
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
interface CloudServiceType {
    name: string;
    recommended_title: string;
    provider: string;
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
        PLottie,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const apiQuery = new ApiQueryHelper();

        const state = reactive({
            items: undefined as unknown as CardData[],
            loading: true,
            cardDataLoading: true,
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
                    const instanceCount = instanceResponse.spot_groups[state.items[i].spot_group_id] as unknown as InstanceCountType || 0;
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
                    const instanceCpu = CpuResponse.spot_groups[state.items[i].spot_group_id] as unknown as InstanceCpuType || 0;
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
                    const instanceDisk = DiskResponse.spot_groups[state.items[i].spot_group_id] as unknown as InstanceDiskType || 0;
                    state.items[i].instanceDisk = Math.round(instanceDisk.total_iops * 100) / 100;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const getSpotGroupLoadbalancerInfo = async (spotGroupIds) => {
            try {
                const LoadbalancerResponse = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupLoadbalancerCount({
                    // eslint-disable-next-line camelcase
                    spot_groups: spotGroupIds,
                });
                Object.keys(state.items).forEach((i) => {
                    const loadbalancerCount = LoadbalancerResponse.spot_groups[state.items[i].spot_group_id] || 0;
                    state.items[i].loadbalancerCount = loadbalancerCount;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const getSpotGroupCloudServiceType = async (spotGroupIds) => {
            try {
                const CloudServiceTypeResponse = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupCloudServiceType({
                    // eslint-disable-next-line camelcase
                    spot_groups: spotGroupIds,
                });
                Object.keys(state.items).forEach((i) => {
                    const cloudServiceType = CloudServiceTypeResponse.spot_groups[state.items[i].spot_group_id] as unknown as CloudServiceType || {};
                    state.items[i].cloudServiceType = cloudServiceType;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const getSpotGroupInstanceState = async (spotGroupIds) => {
            try {
                const StateResponse = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceState({
                    // eslint-disable-next-line camelcase
                    spot_groups: spotGroupIds,
                });
                Object.keys(state.items).forEach((i) => {
                    const instanceState = StateResponse.spot_groups[state.items[i].spot_group_id].state || 'N/A';
                    state.items[i].instanceState = instanceState;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const listSpotGroup = async () => {
            state.loading = true;
            state.cardDataLoading = true;
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.list({ query: getQuery() });
                state.items = res.results.map(d => ({
                    ...d,
                    created_at: timestampFormatter(d.created_at, state.timezone),
                }));
                state.totalCount = res.total_count || 0;
                state.loading = false;
                const spotGroupIds = res.results.map(item => item.spot_group_id) || [];
                await Promise.all([getSpotGroupInstanceCount(spotGroupIds),
                    getSpotGroupCpuInfo(spotGroupIds),
                    getSpotGroupDiskInfo(spotGroupIds),
                    getSpotGroupLoadbalancerInfo(spotGroupIds),
                    getSpotGroupCloudServiceType(spotGroupIds),
                    getSpotGroupInstanceState(spotGroupIds),
                ]);
                state.cardDataLoading = false;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
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
    display: flex;
    flex-direction: column;
    padding: 2rem 1.5rem;
    height: 100%;
}
.cost-instance-info {
    @apply text-gray-900;
    font-size: 0.75rem;
    line-height: 150%;
    margin-bottom: 1rem;
}
.no-spot-group {
    display: flex;
    flex-direction: column;
    .no-spot-group-img {
        margin-bottom: 1rem;
    }
    .no-spot-group-text {
        @apply text-primary2;
        font-size: 1rem;
        line-height: 160%;
    }
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

        @screen sm {
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        }

        @screen md {
            grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
        }

        @screen lg {
            grid-template-columns: repeat(auto-fit, minmax(540px, auto));
        }
    }
}
</style>
