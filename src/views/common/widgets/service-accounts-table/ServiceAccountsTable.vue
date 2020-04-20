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
                    <div class="custom-th"
                         :style="{color: colors.servers}"
                    >
                        {{ field.label }}
                    </div>
                </template>
                <template #th-cloud_services="{field}">
                    <div class="custom-th"
                         :style="{color: colors.cloud_services}"
                    >
                        {{ field.label }}
                    </div>
                </template>
                <template #th-credentials="{field}">
                    <div class="custom-th"
                         :style="{color: colors.credentials, 'font-weight': 'bold'}"
                    >
                        {{ field.label }}
                    </div>
                </template>

                <!-- others -->
                <template #col-service_provider="{value}">
                    <div class="font-bold"
                         :style="{'padding-top':'0.5rem', 'padding-left':'1.04rem', 'vertical-align':'middle'}"
                    >
                        <span class="color" />
                        {{ value }}
                    </div>
                </template>
                <template #col-account_name="{value}">
                    <p-td v-tooltip.bottom="{content: value, delay: {show: 500}}">
                        {{ value }}
                    </p-td>
                </template>
                <template #col-servers-format="{value}">
                    <div class="text-center font-bold" :style="{color: colors.servers}">
                        {{ value }}
                    </div>
                </template>
                <template #col-cloud_services-format="{value}">
                    <div class="text-center font-bold" :style="{color: colors.cloud_services}">
                        {{ value }}
                    </div>
                </template>
                <template #col-credentials-format="{value}">
                    <div class="text-center font-bold" :style="{color: colors.credentials}">
                        {{ value }}
                    </div>
                </template>
            </p-data-table>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import _ from 'lodash';
import {
    computed, defineComponent, getCurrentInstance, Ref, toRefs, reactive,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import { makeTrItems } from '@/lib/view-helper';
import {
    secondary, secondary1, gray,
} from '@/styles/colors';
import PTr from '@/components/atoms/table/Tr.vue';
import PTd from '@/components/atoms/table/Td.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import { SChartToolSet } from '@/lib/chart/toolset';
import { SBarChart } from '@/lib/chart/bar-chart';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import casual, { arrayOf } from '@/lib/casual';

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
                service_provider: string;
                account_name: string;
                servers: number;
                cloud_services: number;
                credentials: number;
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
                    ['service_provider', 'FIELD.SERVICE_PROVIDER'],
                    ['account_name', 'FIELD.ACCOUNT_NAME'],
                    ['servers', 'FIELD.SERVER'],
                    ['cloud_services', 'FIELD.CLOUD_SERVICE'],
                    ['credentials', 'FIELD.CREDENTIALS'],
                ])),
            });

            const api = async (): Promise<DataType[]> => new Promise((resolve) => {
                resolve(arrayOf(5, () => ({
                    service_provider: casual.integer(0, 3),
                    account_name: casual.text,
                    servers: casual.integer(0, 300),
                    cloud_services: casual.integer(0, 300),
                    credentials: casual.integer(0, 300),
                })) as unknown as DataType[]);
            });


            const getData = async (): Promise<void> => {
                state.loading = true;
                state.data = await api();
                state.loading = false;
            };

            setTimeout(() => {
                getData();
            }, 1000);

            return {
                ...toRefs(state),
                onRowClick() {
                    vm.$router.push('/identity/project');
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
    .project-field {
        @apply truncate font-bold;
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
         width: 7.6rem;
     }
    &:nth-child(2) {
         width: 5.6rem;
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
