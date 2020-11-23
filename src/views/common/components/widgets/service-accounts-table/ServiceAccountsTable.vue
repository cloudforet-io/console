<template>
    <widget-layout :title="$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE_TITLE')" class="accounts-table">
        <div class="mt-4 overflow-auto">
            <p-data-table :fields="fields"
                          :sortable="false"
                          :selectable="false"
                          :bordered="false"
                          :loading="loading"
                          :items="data"
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
                    <td v-tooltip.bottom="{content: item.service_account_name, delay: {show: 500}}">
                        <router-link :to="`/identity/service-account?p=1&ps=15&provider=${item.provider}&filters=${item.service_account_name}`">
                            {{ item.service_account_name || 0 }}
                        </router-link>
                    </td>
                </template>
                <template #col-server_count-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.servers}">
                        <router-link :to="`/inventory/server?p=1&ps=15&filters=collection_info.service_accounts%3A${item.service_account_id}&filters=project_id%3A%3D${item.project_id}`">
                            {{ item.server_count || 0 }}
                        </router-link>
                    </div>
                </template>
                <template #col-cloud_service_count-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.cloud_services}">
                        <router-link :to="`/inventory/cloud-service?provider=all&filters=collection_info.service_accounts%3A${item.service_account_id}&filters=project_id%3A%3D${item.project_id}`">
                            {{ item.cloud_service_count || 0 }}
                        </router-link>
                    </div>
                </template>
                <template #col-secret_count-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.credentials}">
                        {{ item.secret_count || 0 }}
                    </div>
                </template>
            </p-data-table>
        </div>
    </widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import { gray, secondary, secondary1 } from '@/styles/colors';
import { store } from '@/store';
import { SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'ServiceAccountsTable',
    components: {
        WidgetLayout,
        PDataTable,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const projectId = computed<string>(() => context.root.$route.params.id as string);

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
                fields: computed(() => [
                    { name: 'provider', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE_SERVICE_PROVIDER') },
                    { name: 'service_account_name', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE_ACCOUNT_NAME') },
                    { name: 'server_count', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE_SERVER') },
                    { name: 'cloud_service_count', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE_CLOUD_SERVICE') },
                    { name: 'secret_count', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE_CREDENTIALS') },
                ]),
                providers: computed(() => store.state.resource.provider.items),
            });

            const getData = async () => {
                state.loading = true;
                state.data = [];
                await store.dispatch('resource/provider/load');
                try {
                    const res = await SpaceConnector.client.statistics.topic.serviceAccountSummary({
                        project_id: projectId.value,
                    });
                    state.data = res.results.map(item => ({
                        provider: item.provider,
                        provider_color: state.providers[item.provider].color,
                        service_account_name: item.service_account_name,
                        service_account_id: item.service_account_id,
                        cloud_service_count: item.cloud_service_count || 0,
                        server_count: item.server_count || 0,
                        secret_count: item.secret_count || 0,
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
.p-data-table::v-deep {
    table-layout: fixed;
    font-size: 0.875rem;
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
        @apply relative border-0;
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
