<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <p-grid-layout
                class="provider-list"
                v-bind="providerListState.state"
                @card:click="selectProvider=$event.provider"
            >
                <template #card="{item}">
                    <div class="left">
                        <template>
                            <img v-if="item.icon"
                                 width="32px" height="32px"
                                 :src="item.icon"
                                 :alt="item.provider"
                            >
                            <p-i v-else name="ic_provider_other"
                                 width="32px"
                                 height="32px"
                            />
                        </template>
                        <div class="title">
                            {{ item.name }}
                        </div>
                    </div>
                    <div class="right">
                        <div
                            class="total-count"
                            :style="{'background-color': item.color||'#3C2C84','border-color': item.color||'#3C2C84'}"
                        >
                            {{ providerTotalCount[item.provider]||0 }}
                        </div>
                    </div>
                </template>
            </p-grid-layout>
        </template>
        <template #default>
            <div class="text-xs text-gray-500 mb-1">
                Cloud Service Provider
            </div>
            <PPageTitle :title="selectProviderName" use-total-count :total-count="apiHandler.totalCount.value"
                        class="pagetitle"
            />
            <div class="cloud-services">
                <PToolboxGridLayout
                    v-bind="apiHandler.gridTS.state"
                    :this-page.sync="apiHandler.gridTS.syncState.thisPage"
                    :page-size.sync="apiHandler.gridTS.syncState.pageSize"
                    @changePageNumber="apiHandler.getData()"
                    @changePageSize="apiHandler.getData()"
                    @clickRefresh="apiHandler.getData()"
                    @card:click="clickCard"
                    @clickExcel="exportToolSet.getData()"
                >
                    <template slot="toolbox-bottom">
                        <div class="cst-toolbox-bottom">
                            <PSearch :search-text.sync="apiHandler.gridTS.searchText.value" @onSearch="apiHandler.getData(true)" />
                        </div>
                    </template>
                    <template #no-data>
                        <div class="text-center empty-project">
                            <img class="w-48 mx-auto pt-19 mb-8" src="@/assets/images/illust_satellite.svg">
                            <p class="text-primary2 mb-12">
                                We need your registration for monitoring cloud resources.
                            </p>
                            <p-icon-text-button style-type="primary" name="ic_plus_bold"
                                                class="mx-auto text-center"
                                                @click="goToServiceAccount"
                            >
                                {{ $t('BTN.ADD_SERVICE_ACCOUNT') }}
                            </p-icon-text-button>
                        </div>
                    </template>
                    <template #card="{item}">
                        <div class="left">
                            <div class="w-12 h-12">
                                <img v-if="item.tags['spaceone:icon']"
                                     width="48px" height="48px"
                                     :src="item.tags['spaceone:icon']"
                                     :alt="item.name"
                                >
                                <img v-else-if="providerStore.state.providers[item.provider]"
                                     width="48px" height="48px"
                                     :src="providerStore.state.providers[item.provider].icon"
                                     :alt="item.provider"
                                >
                                <p-i v-else name="ic_provider_other" width="48px"
                                     height="48px"
                                />
                            </div>
                            <div class="text-content">
                                <div class="title">
                                    {{ item.group }}
                                </div>
                                <div class="sub-title">
                                    <span class="sub-title-provider"> {{ item.provider }} </span>
                                    <span class="sub-title-divider">
                                        |
                                    </span>
                                    <span class="sub-title-name">{{ item.name }}</span>
                                    <span v-if="statData" class="sub-title-count">
                                        {{ statData[item.cloud_service_type_id][totalResourceCountName]||0 }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <!--                        <div v-if="statData" class="right">-->
                        <!--                            <div v-if="statData[item.cloud_service_type_id][newResourceCountName]" class="today-created">-->
                        <!--                                <p-i name="ic_list_increase" width="12px" height="12px" />-->
                        <!--                                <div class="number">-->
                        <!--                                    {{ statData[item.cloud_service_type_id][newResourceCountName] }}-->
                        <!--                                </div>-->
                        <!--                            </div>-->
                        <!--                            <div class="total-count">-->
                        <!--                                {{ statData[item.cloud_service_type_id][totalResourceCountName]||0 }}-->
                        <!--                            </div>-->
                        <!--                        </div>-->
                        <!--                        <PSkeleton v-else width="5rem" height="1.875rem" />-->
                    </template>
                </PToolboxGridLayout>
            </div>
        </template>
    </p-vertical-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    computed, getCurrentInstance, onMounted, reactive, ref, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import { fluentApi } from '@/lib/fluent-api';
import { ProviderStoreType, useStore } from '@/store/toolset';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/ToolboxGridLayout.vue';
import {
    DefaultQSGridQSProps,
    RouteSearchGridFluentAPI,
} from '@/lib/api/grid';
import { AxiosResponse } from 'axios';
import { CloudServiceTypeListResp } from '@/lib/fluent-api/inventory/cloud-service-type';
import _ from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import {
    propsCopy,
} from '@/lib/router-query-string';
import {
    SelectGridLayoutToolSet,
    DefaultSingleItemSelectGridQSProps,
    DefaultMultiItemSelectGridQSProps,
} from '@/components/molecules/layouts/grid-layout/toolset';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';

export default {
    name: 'ServiceAccount',
    components: {
        PIconTextButton,
        PVerticalPageLayout,
        PSearch,
        PI,
        PToolboxGridLayout,
        PGridLayout,
        PSkeleton,
        PPageTitle,
    },
    props: {
        ...DefaultQSGridQSProps,
        ...DefaultMultiItemSelectGridQSProps,
        ...DefaultSingleItemSelectGridQSProps,
    },
    setup(props, context) {
        const {
            provider,
        } = useStore();
        const providerStore: ProviderStoreType = provider;
        providerStore.getProvider();
        const providerTotalCount = ref<any>({ all: 0 });
        const cstCountName = 'cloud_service_type_count';
        const cstCountApi = fluentApi.statisticsTest().resource().stat()
            .setResourceType('inventory.CloudServiceType')

            .addGroupKey('provider', 'provider')

            .setJoinKeys(['provider'], 0)
            .setJoinResourceType('inventory.CloudServiceType', 0)
            .addJoinGroupKey('provider', 'provider', 0)
            .addJoinGroupField(cstCountName, STAT_OPERATORS.count, undefined, 0);
        const vm = getCurrentInstance() as ComponentInstance;
        const selectProvider = ref('all');
        const providerListState = new SelectGridLayoutToolSet(vm,
            undefined,
            undefined,
            selectProvider,
            undefined,
            {
                items: computed(() => {
                    const result = [{
                        provider: 'all', icon: '', color: '', name: 'All',
                    }];
                    if (providerStore.state.providers) {
                        result.push(...Object.entries(providerStore.state.providers).map(([key, value]) => ({ provider: key, ...value })));
                    }
                    return result;
                }),
                cardClass: (item) => {
                    const _class = ['provider-card-item', 'card-item'];
                    if (item.provider === selectProvider.value) {
                        _class.push('selected');
                    }
                    return _class;
                },
                cardMinWidth: '14.125rem',
                cardHeight: '3.5rem',
                columnGap: '0.5rem',
                rowGap: '0.5rem',
                fixColumn: 1,
            });
        const selectProviderName = computed(() => _.find(providerListState.state.items, { provider: selectProvider.value }).name);
        const totalResourceCountName = 'cloud_service_count';

        const newResourceCountName = 'yesterday_cloud_service_count';
        const metricAPI = fluentApi.statisticsTest().resource().stat()
            .setResourceType('inventory.CloudServiceType')

            .addGroupKey('name', 'cloud_service_type')
            .addGroupKey('cloud_service_type_id', 'cloud_service_type_id')
            .addGroupKey('group', 'cloud_service_group')
            .addGroupKey('provider', 'provider')

            .setJoinKeys(['cloud_service_type', 'cloud_service_group', 'provider'], 0)
            .setJoinResourceType('inventory.CloudService', 0)
            .addJoinGroupKey('cloud_service_type', 'cloud_service_type', 0)
            .addJoinGroupKey('cloud_service_group', 'cloud_service_group', 0)
            .addJoinGroupKey('provider', 'provider', 0)
            .addJoinGroupField(totalResourceCountName, STAT_OPERATORS.count, undefined, 0)

            .setJoinKeys(['cloud_service_type', 'cloud_service_group', 'provider'], 1)
            .setJoinResourceType('inventory.CloudService', 1)
            .addJoinGroupKey('cloud_service_type', 'cloud_service_type', 1)
            .addJoinGroupKey('cloud_service_group', 'cloud_service_group', 1)
            .addJoinGroupKey('provider', 'provider', 1)
            .addJoinGroupField(newResourceCountName, STAT_OPERATORS.count, undefined, 1)
            .setJoinFilter([{ key: 'created_at', value: 'now/d', operator: 'td_gte' }], 1);

        const statData = ref<null|any>(null);
        const getMetric = (resp: AxiosResponse<CloudServiceTypeListResp>) => {
            const ids = resp.data.results.map(item => item.cloud_service_type_id);
            statData.value = null;
            metricAPI.setFilter(
                { key: 'cloud_service_type_id', operator: '=', value: ids },
            ).execute().then((rp) => {
                const data = {};
                rp.data.results.forEach((item) => {
                    data[item.cloud_service_type_id] = item;
                });
                statData.value = data;
            });
            return resp;
        };

        const listAction = fluentApi.inventory().cloudServiceType().list()
            .setOnly('provider', 'group', 'name', 'tags.spaceone:icon', 'cloud_service_type_id')
            .setTransformer(getMetric);

        const apiHandler = new RouteSearchGridFluentAPI(
            listAction,
            {
                cardClass: () => ['card-item', 'cst-card-item'],
                cardMinWidth: '28rem',
                cardHeight: '6rem',
                excelVisible: false,
            },
            undefined,
            undefined,
            vm,
        );

        const clickCard = (item) => {
            vm?.$router.push({
                name: 'cloudServicePage',
                params: {
                    provider: item.provider,
                    group: item.group,
                    name: item.name,
                },
            });
        };

        const goToServiceAccount = () => {
            vm?.$router.push({
                name: 'serviceAccount',
            });
        };

        const dataSource = [
            { name: 'provider', key: 'provider' },
            { name: 'group', key: 'group' },
            { name: 'name', key: 'name' },
        ];
        const exportAction = fluentApi.addons().excel().export().setDataSource(dataSource);
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);


        const requestProvider = async () => {
            const resp = await cstCountApi.execute();
            let total = 0;
            const data: any = { };
            resp.data.results.forEach((item) => {
                const count = item[cstCountName];
                total += count;
                data[item.provider] = count;
            });
            data.all = total;
            providerTotalCount.value = data;
        };

        const setFixFilter = (pro: string, handler: RouteSearchGridFluentAPI<any, any>, reset = true) => {
            if (pro === 'all') {
                handler.action = listAction.setFixFilter();
            } else {
                handler.action = listAction.setFixFilter(
                    { key: 'provider', operator: '=', value: pro },
                );
            }
            if (reset) {
                handler.resetAll();
            }
        };
        const routerHandler = async () => {
            const prop = propsCopy(props);
            await requestProvider();
            providerListState.applyDisplayRouter(prop);
            setFixFilter(prop.st || 'all', apiHandler, false);
            apiHandler.applyAPIRouter(prop);
            await apiHandler.getData();
        };

        onMounted(async () => {
            await routerHandler();
            const getData = _.debounce(() => apiHandler.getData(), 50);
            let ready = false;
            watch(selectProvider, (after, before) => {
                if (ready && after && after !== before) {
                    setFixFilter(after, apiHandler);
                    getData();
                }
            });
            ready = true;
        });
        return {
            selectProvider,
            selectProviderName,
            apiHandler,
            clickCard,
            goToServiceAccount,
            providerStore,
            statData,
            providerListState,
            providerTotalCount,
            exportToolSet,
            newResourceCountName,
            totalResourceCountName,
            routerHandler,
        };
    },

};

</script>

<style lang="postcss" scoped>
    .cst-toolbox-bottom{
        @apply flex flex-col-reverse items-start justify-between w-full mb-4;
        @screen lg {
            @apply flex-row items-center;
        }
        .search-bar{
            @apply flex-1;
            @screen lg{
                @apply max-w-1/2;
            }
        }
        .checkbox{
            @apply whitespace-no-wrap;

        }
    }
    .provider-list{
        @apply w-full px-4 pt-6;

    }
    >>> .provider-card-item{
        @apply px-4 py-3 flex items-center justify-between bg-transparent;

        .left{
            @apply flex items-center;
            .title {
                @apply ml-4;

            }
        }
        .right{
            .total-count{
                @apply w-10 flex h-6 ml-2 justify-center items-center text-white;
                border-radius: 6.25rem;
                border-width: 0.0625rem;

            }
        }
        &.selected{
            @apply border-secondary bg-blue-200 text-secondary;
            .left{
                .title{
                    @apply text-secondary;
                }
            }
        }

    }

    >>> .cst-card-item{
        @apply p-6 flex flex-row justify-between items-center;
        .left{
            @apply inline-flex items-center;
            img {
                @apply rounded-sm overflow-hidden;
            }
            .text-content{
                @apply ml-4;
                .title{
                    padding-bottom: .3rem;
                    font-size: 1rem;
                    line-height: 120%;
                }
                .sub-title{
                    @apply text-gray-500;
                    font-size: 0.875rem;
                    line-height: 150%;
                    .sub-title-provider {
                        @apply text-gray-300;
                    }
                    .sub-title-divider {
                        @apply px-2 text-gray-200;
                    }
                    .sub-title-name {
                        @apply text-gray-500;
                    }
                    .sub-title-count {
                        @apply ml-2 font-bold text-base;
                        line-height: 150%;
                    }
                }
            }
        }
        .right{
            @apply inline-flex items-center ;
            .total-count {
                @apply font-bold text-2xl;
            }
            .today-created {
                @apply border-green-500 flex h-6 ml-2 justify-center items-center mr-2;
                border-radius: 6.25rem;
                border-width: 0.0625rem;
                min-width: 2.5rem;
                .number {
                    @apply font-bold text-sm text-green-500 w-auto h-4 text-right;
                    line-height: 1.0625rem;
                }
            }
        }
        &:hover {
             @apply border-gray-200 bg-blue-100;
             cursor: pointer;
         }
    }
    .pagetitle{
        margin-bottom:0;
    }
</style>
