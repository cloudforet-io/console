<template>
    <p-widget-layout title="Service Accounts" class="accounts-table">
        <div class="mt-4 overflow-auto">
            <p-data-table :fields="fields"
                          :sortable="false"
                          :selectable="false"
                          :bordered="false"
                          :loading="loading"
                          :items="data"
                          :top-border="false"
                          class="data-table"
            >
                <!-- th -->
                <template #th-server_count="{field}">
                    <div class="text-center custom-th"
                         :style="{color: colors.servers}"
                    >
                        {{ field.label }}
                    </div>
                </template>
                <template #th-cloud_service_count="{field}">
                    <div class="text-center custom-th"
                         :style="{color: colors.cloud_services}"
                    >
                        {{ field.label }}
                    </div>
                </template>
                <template #th-secret_count="{field}">
                    <div class="text-center custom-th" :style="{color: colors.credentials, 'font-weight': 'bold'}">
                        {{ field.label }}
                    </div>
                </template>

                <!-- others -->
                <template #col-provider-format="{index, field, item}">
                    <div class="font-bold"
                         :style="{'padding-left': '1.04rem','vertical-align': 'middle'}"
                    >
                        <router-link :to="`/identity/service-account?p=1&ps=15&provider=${item.provider}`">
                            <span class="color" :style="{color: data[index].provider_color}" />
                            {{ item.provider || 0 }}
                        </router-link>
                    </div>
                </template>
                <template #col-service_account_name="{index, field, item}">
                    <p-td v-tooltip.bottom="{content: item.service_account_name, delay: {show: 500}}">
                        <router-link :to="`/identity/service-account?p=1&ps=15&provider=${item.provider}&t_se=${item.service_account_name}`">
                            {{ item.service_account_name || 0 }}
                        </router-link>
                    </p-td>
                </template>
                <template #col-server_count-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.servers}">
                        <router-link :to="`/inventory/server?p=1&ps=15&f=collection_info.service_accounts%3A${item.service_account_id}&f=project_id%3A%3D${item.project_id}`">
                            {{ item.server_count || 0 }}
                        </router-link>
                    </div>
                </template>
                <template #col-cloud_service_count-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.cloud_services}">
                        {{ item.cloud_service_count || 0 }}
                    </div>
                </template>
                <template #col-secret_count-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.credentials}">
                        {{ item.secret_count || 0 }}
                    </div>
                </template>
            </p-data-table>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import { makeTrItems } from '@/lib/view-helper';
import { gray, secondary, secondary1 } from '@/styles/colors';
import PTd from '@/components/atoms/table/Td.vue';
import { fluentApi } from '@/lib/fluent-api';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import { ProviderInfo, ProviderStoreType, useStore } from '@/store/toolset';

export default {
    name: 'ServiceAccountsTable',
    components: {
        PWidgetLayout,
        PDataTable,
        PTd,
    },
    setup(props, context) {
        const projectId = computed<string>(() => context.root.$route.params.id as string);
        const {
            provider,
        } = useStore();
        const providerStore: ProviderStoreType = provider;

            interface DataType {
                provider: string;
                provider_color: string;
                service_account_id: string;
                service_account_name: string;
                server_count: number;
                cloud_service_count: number;
                secret_count: number;
                project_id: string;
            }

            const state = reactive({
                data: [] as object[],
                loading: true,
                colors: {
                    servers: secondary,
                    cloud_services: secondary1,
                    credentials: gray,
                },
                fields: computed(() => makeTrItems([
                    ['provider', 'FIELD.SERVICE_PROVIDER'],
                    ['service_account_name', 'FIELD.ACCOUNT_NAME'],
                    ['server_count', 'FIELD.SERVER'],
                    ['cloud_service_count', 'FIELD.CLOUD_SERVICE'],
                    ['secret_count', 'FIELD.CREDENTIALS'],
                ])),
            });

            const api = fluentApi.statisticsTest().resource().stat<DataType>()
                .setFilter({
                    key: 'project_id',
                    value: projectId.value,
                    operator: '=',
                })
                .setResourceType('identity.ServiceAccount')
                .addGroupKey('provider', 'provider')
                .addGroupKey('service_account_id', 'service_account_id')
                .addGroupKey('name', 'service_account_name')

                .setJoinResourceType('inventory.Server')
                .addJoinKey('service_account_id')
                .addJoinUnwind({
                    path: 'collection_info.service_accounts',
                })
                .addJoinGroupKey('collection_info.service_accounts', 'service_account_id')
                .addJoinGroupField('server_count', STAT_OPERATORS.count, undefined)

                .addJoinKey('service_account_id', 1)
                .setJoinResourceType('inventory.CloudService', 1)
                .addJoinUnwind({
                    path: 'collection_info.service_accounts',
                }, 1)
                .addJoinGroupKey('collection_info.service_accounts', 'service_account_id', 1)
                .addJoinGroupField('cloud_service_count', STAT_OPERATORS.count, undefined, 1)

                .setJoinResourceType('secret.Secret', 2)
                .addJoinKey('service_account_id', 2)
                .addJoinGroupKey('service_account_id', 'service_account_id', 2)
                .addJoinGroupField('secret_count', STAT_OPERATORS.count, undefined, 2)

                .addFormula('resource_count', 'server_count + cloud_service_count')
                .setSort('resource_count');

            const getData = async () => {
                state.loading = true;
                state.data = [];
                await providerStore.getProvider();
                try {
                    const res = await api.execute();
                    const providers: ProviderInfo = providerStore.state.providers;
                    state.data = res.data.results.map(item => ({
                        provider: item.provider,
                        provider_color: providers[item.provider].color,
                        service_account_name: item.service_account_name,
                        service_account_id: item.service_account_id,
                        cloud_service_count: item?.cloud_service_count || 0,
                        server_count: item?.server_count || 0,
                        secret_count: item?.secret_count || 0,
                        project_id: projectId.value,
                    }));
                } catch (e) {
                    console.error(e);
                } finally {
                    state.loading = false;
                }
            };

            setTimeout(() => {
                getData();
            }, 1000);

            return {
                ...toRefs(state),
            };
    },
};
</script>

<style lang="postcss" scoped>
    .color {
        display: inline-block;
        width: 0.75rem;
        height: 0.75rem;
        margin-right: 0.5rem;
        border-radius: 2px;
        background: currentColor;
    }
    .custom-th {
        @apply flex items-center justify-center uppercase font-bold px-1;
        font-size: 0.75rem;
    }
    .data-table::v-deep {
        .p-table {
            table-layout: fixed;
            font-size: 0.875rem;
        }
        tr {
            &:nth-child(2n+1) {
                 @apply bg-primary4;
             }
        }
        td {
            @apply truncate cursor-pointer;
            &:first-child {
                 padding: 0;
             }
        }
        th {
            &:first-child {
                 width: 5.6rem;
             }
            &:nth-child(2) {
                 width: 5.6rem;
             }
            &:nth-child(3) {
                 width: 4.6rem;
             }
            &:nth-child(4) {
                 width: 4.6rem;
             }
            &:last-child {
                 width: 4.6rem;
             }
        }
    }
</style>
