<template>
    <section class="spot-group-list-wrapper">
        <p-breadcrumbs :routes="routeState.route" />
        <section class="page-title">
            <p-page-title :title="$t('AUTOMATION.SPOT_AUTOMATION.MAIN.SPOT_GROUP')" use-total-count :total-count="totalCount" />
            <router-link :to="{ name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP.ADD._NAME }">
                <p-icon-text-button style-type="primary-dark" outline name="ic_plus_bold"
                                    class="add-spot-group-btn"
                >
                    {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.ADD_SPOT_GROUP') }}
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
        >
            <template #left-area>
                <p-check-box v-model="showFavorites">
                    <span class="show-favorite">{{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.SHOW_FAVORITES') }}</span>
                </p-check-box>
            </template>
        </p-toolbox>
        <p class="cost-instance-info">
            {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.COST_INSTANCE_DATE_1') }}<strong> {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.COST_INSTANCE_DATE_2') }}</strong>
        </p>
        <p-data-loader class="flex-grow" :data="items" :loading="loading"
                       :class="{'short': isShort}"
        >
            <div class="card-wrapper" :class="{'short': isShort}">
                <div v-for="item in items" :key="item.spot_group_id" class="spot-group-card">
                    <spot-group-card
                        :card-data="item"
                        :is-short="isShort"
                        :card-data-loading="cardDataLoading"
                    />
                </div>
            </div>
            <template #no-data>
                <section class="no-spot-group">
                    <figure class="no-spot-group-img">
                        <img src="@/assets/images/illust_no-spot-group.svg">
                    </figure>
                    <p class="no-spot-group-text">
                        {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.NO_DATA') }}
                    </p>
                </section>
            </template>
        </p-data-loader>
    </section>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    PBreadcrumbs, PPageTitle, PDivider, PToolbox, PIconTextButton, PDataLoader, PLottie, PCheckBox,
} from '@spaceone/design-system';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { getPageStart, getThisPage } from '@spaceone/console-core-lib/component-util/pagination';
import SpotGroupCard from '@/views/automation/spot-automation/modules/spot-group-card/SpotGroupCard.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { store } from '@/store';
import { Tags, TimeStamp } from '@/models';
import { makeDistinctValueHandler, makeReferenceValueHandler } from '@spaceone/console-core-lib/component-util/query-search';
import { AUTOMATION_ROUTE } from '@/routes/automation/automation-route';

dayjs.extend(timezone);

const handlers = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            {
                name: 'spot_group_id',
                label: 'Spot Group ID',
            },
            {
                name: 'name',
                label: 'Name',
            },
            {
                name: 'resource_id',
                label: 'Resource ID',
            },
            {
                name: 'provider',
                label: 'Provider',
            },
            {
                name: 'project_id',
                label: 'Project',
            },
            {
                name: 'created_at',
                label: 'Created At',
            },
            {
                name: 'created_by',
                label: 'Created By',
            },
        ],
    }],
    valueHandlerMap: {
        spot_group_id: makeDistinctValueHandler('spot_automation.SpotGroup', 'spot_group_id'),
        name: makeDistinctValueHandler('spot_automation.SpotGroup', 'name'),
        provider: makeReferenceValueHandler('identity.Provider'),
        region: makeReferenceValueHandler('inventory.Region'),
        project_id: makeReferenceValueHandler('identity.Project'),
        resource_id: makeDistinctValueHandler('spot_automation.SpotGroup', 'resource_id'),
        created_at: makeDistinctValueHandler('spot_automation.SpotGroup', 'created_at'),
        created_by: makeDistinctValueHandler('spot_automation.SpotGroup', 'created_by'),
    },
};

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
    interruptHistoryData: string;
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
interface InstanceStateType {
    total: number;
    healthy: number;
    unhealthy: number;
    state: string;
}
interface InterruptHistoryType {
    date: string;
    count: number;
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
        PCheckBox,
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
            showFavorites: false,
        });
        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.SPOT_AUTOMATION') },
            ]),
        });

        const getQuery = () => {
            if (state.showFavorites) {
                const favoriteList = store.getters['favorite/spotGroup/sortedItems'];
                const favorites = favoriteList.map(d => d.id);
                apiQuery.setPageStart(getPageStart(state.thisPage, state.pageSize))
                    .setPageLimit(state.pageSize)
                    .setFilters(queryHelper.filters)
                    .addFilter(
                        { k: 'spot_group_id', o: '=', v: favorites },
                    );
            } else {
                apiQuery.setPageStart(getPageStart(state.thisPage, state.pageSize))
                    .setPageLimit(state.pageSize)
                    .setFilters(queryHelper.filters);
            }
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
                const CloudServiceTypeResponse: InstanceRes<CloudServiceType> = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupCloudServiceType({
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
                const StateResponse: InstanceRes<InstanceStateType> = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceState({
                    // eslint-disable-next-line camelcase
                    spot_groups: spotGroupIds,
                });
                Object.keys(state.items).forEach((i) => {
                    const instanceState = StateResponse.spot_groups[state.items[i].spot_group_id].state as unknown as InstanceStateType || 'N/A';
                    state.items[i].instanceState = instanceState;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const getSpotGroupInterruptHistory = async (spotGroupIds) => {
            try {
                const HistoryResponse: InstanceRes<InterruptHistoryType> = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInterruptHistory({
                    // eslint-disable-next-line camelcase
                    spot_groups: spotGroupIds,
                    granularity: 'DAILY',
                    period: 7,
                });
                Object.keys(state.items).forEach((i) => {
                    const interruptHistory = HistoryResponse.spot_groups[state.items[i].spot_group_id] as unknown as InterruptHistoryType || 'N/A';
                    state.items[i].interruptHistoryData = interruptHistory;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const getSpotGroupInterruptCount = async (spotGroupIds) => {
            try {
                const InterruptResponse = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInterrupt({
                    spot_groups: spotGroupIds,
                });
                Object.keys(state.items).forEach((i) => {
                    const interruptCount = InterruptResponse.spot_groups[state.items[i].spot_group_id] || 0;
                    state.items[i].interruptCount = interruptCount;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const getSpotGroupCostSavingResult = async (spotGroupIds) => {
            try {
                const SavingResponse = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupSavingCost({
                    spot_groups: spotGroupIds,
                    month: dayjs.utc().format('YYYY-MM'),
                });
                Object.keys(state.items).forEach((i) => {
                    const savingResult = SavingResponse.spot_groups[state.items[i].spot_group_id].saving_result || 0;
                    state.items[i].savingResult = savingResult.toLocaleString();
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
                    created_at: iso8601Formatter(d.created_at, state.timezone),
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
                    getSpotGroupInterruptHistory(spotGroupIds),
                    getSpotGroupInterruptCount(spotGroupIds),
                    getSpotGroupCostSavingResult(spotGroupIds),
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

        watch(() => state.showFavorites, (before, after) => {
            if (after !== before) listSpotGroup();
        }, { immediate: true });


        return {
            ...toRefs(state),
            routeState,
            AUTOMATION_ROUTE,
            onChange,
            iso8601Formatter,
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
.show-favorite {
    font-size: 0.875rem;
    line-height: 200%;
    margin-left: .125rem;
}
.cost-instance-info {
    @apply text-gray-900;
    font-size: 0.75rem;
    line-height: 150%;
    margin-bottom: 0.5rem;
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
