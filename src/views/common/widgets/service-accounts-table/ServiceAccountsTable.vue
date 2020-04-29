<template>
    <p-widget-layout title="SERVICE ACCOUNT" class="accounts-table">
        <div class="mt-4 overflow-auto">
            <p-data-table :fields="fields"
                          :sortable="false"
                          :selectable="false"
                          :loading="loading"
                          :items="data"
                          :top-border="false"
                          class="data-table"
                          @rowLeftClick="onRowClick"
            >
                <!-- th -->
                <template #th-servers="{field}">
                    <div class="text-center custom-th"
                         :style="{color: colors.servers}"
                    >
                        {{ field.label }}
                    </div>
                </template>
                <template #th-cloud_services="{field}">
                    <div class="text-center custom-th"
                         :style="{color: colors.cloud_services}"
                    >
                        {{ field.label }}
                    </div>
                </template>
                <template #th-credentials="{field}">
                    <div class="text-center custom-th"
                         :style="{color: colors.credentials, 'font-weight': 'bold'}"
                    >
                        {{ field.label }}
                    </div>
                </template>

                <!-- others -->
                <template #col-provider-format="{value}">
                    <div class="font-bold"
                         :style="{'padding-top':'0.5rem', 'padding-left':'1.04rem', 'vertical-align':'middle'}"
                    >
                        <span class="color" />
                        {{ value || 0 }}
                    </div>
                </template>
                <template #col-account_name="{value}">
                    <p-td v-tooltip.bottom="{content: value, delay: {show: 500}}">
                        {{ value || 0 }}
                    </p-td>
                </template>
                <template #col-server_count-format="{value}">
                    <div class="text-center font-bold" :style="{color: colors.servers}">
                        {{ value || 0 }}
                    </div>
                </template>
                <template #col-cloud_service_count-format="{value}">
                    <div class="text-center font-bold" :style="{color: colors.cloud_services}">
                        {{ value || 0 }}
                    </div>
                </template>
                <template #col-secret_count-format="{value}">
                    <div class="text-center font-bold" :style="{color: colors.credentials}">
                        {{ value || 0 }}
                    </div>
                </template>
            </p-data-table>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, defineComponent, getCurrentInstance, reactive, Ref, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import { makeTrItems } from '@/lib/view-helper';
import { gray, secondary, secondary1 } from '@/styles/colors';
import PTr from '@/components/atoms/table/Tr.vue';
import PTd from '@/components/atoms/table/Td.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import { fluentApi } from '@/lib/fluent-api';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';

export default defineComponent({
    name: 'ServiceAccountsTable',
    components: {
        PWidgetLayout,
        PBadge,
        PDataTable,
        PTr,
        PTd,
        PI,
        PChartLoader,
        PSkeleton,
    },
    setup() {
        const vm: any = getCurrentInstance();

            interface DataType {
                provider: string;
                service_account_name: string;
                server_count: number;
                cloud_service_count: number;
                secret_count: number;
            }

            interface InitDataType {
                data: Array<DataType | undefined>;
                loading: boolean;
                colors: {
                    servers: string;
                    cloud_services: string;
                    credentials: string;
                };
                fields: Ref<Readonly<string[]>>;
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
                try {
                    const res = await api.execute();
                    state.data = res.data.results.map((item) => ({
                        provider: item.provider,
                        service_account_name: item.service_account_name,
                        cloud_service_count: item?.cloud_service_count || 0,
                        server_count: item?.server_count || 0,
                        secret_count: item?.secret_count || 0,
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
                onRowClick() {
                    vm.$router.push('/plugin/project');
                },
            };
    },
});
</script>

<style lang="postcss" scoped>
    .color {
        display: inline-block;
        width: 0.75rem;
        height: 0.75rem;
        margin-right: 0.5rem;
        border-radius: 2px;
        background-color: currentColor;
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
                 width: 6.6rem;
             }
            &:nth-child(3) {
                 width: 7.6rem;
             }
            &:nth-child(4) {
                 width: 7.6rem;
             }
            &:last-child {
                 width: 7.6rem;
             }
        }
    }
</style>
