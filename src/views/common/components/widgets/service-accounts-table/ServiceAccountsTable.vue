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
                        <router-link :to="item.provider.href">
                            <span class="color" :style="{color: data[index].provider.providerColor}" />
                            {{ item.provider.label || 0 }}
                        </router-link>
                    </div>
                </template>
                <template #col-service_account_name-format="{index, field, item}">
                    <td v-tooltip.bottom="{content: item.serviceAccount.label, delay: {show: 500}}">
                        <router-link :to="item.serviceAccount.href">
                            {{ item.serviceAccount.label || 0 }}
                        </router-link>
                    </td>
                </template>
                <template #col-server_count-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.servers}">
                        <router-link :to="item.server.href">
                            {{ item.server.count || 0 }}
                        </router-link>
                    </div>
                </template>
                <template #col-cloud_service_count-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.cloud_services}">
                        <router-link :to="item.cloudService.href">
                            {{ item.cloudService.count|| 0 }}
                        </router-link>
                    </div>
                </template>
                <template #col-secret_count-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.credentials}">
                        {{ item.secret.count || 0 }}
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

import {
    PDataTable,
} from '@spaceone/design-system';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import { gray, secondary, secondary1 } from '@/styles/colors';
import { store } from '@/store';
import { SpaceConnector } from '@/lib/space-connector';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { QueryHelper } from '@/lib/query';
import { Location } from 'vue-router';
import { QueryStoreFilter } from '@/lib/query/type';

export default {
    name: 'ServiceAccountsTable',
    components: {
        WidgetLayout,
        PDataTable,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const projectId = computed<string>(() => context.root.$route.params.id as string);
        const queryHelper = new QueryHelper();

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

            const getLink = (type, provider, serviceAccountId) => {
                let link: Location = {};
                const filters: QueryStoreFilter[] = [];
                if (type === 'provider') {
                    link = {
                        name: 'serviceAccount',
                        query: {
                            provider,
                        },
                    };
                }
                if (type === 'cloudService') {
                    filters.push({ k: 'collection_info.service_accounts', v: serviceAccountId, o: '=' },
                        { k: 'project_id', v: projectId.value, o: '=' });
                    link = {
                        name: 'cloudServiceMain',
                        query: {
                            provider: 'all',
                            filters: queryHelper.setFilters(filters).rawQueryStrings,
                        },
                    };
                }
                if (type === 'server') {
                    filters.push({ k: 'collection_info.service_accounts', v: serviceAccountId, o: '=' },
                        { k: 'project_id', v: projectId.value, o: '=' });
                    link = {
                        name: 'server',
                        query: {
                            filters: queryHelper.setFilters(filters).rawQueryStrings,
                        },
                    };
                }
                return link;
            };

            const getData = async () => {
                state.loading = true;
                state.data = [];
                await store.dispatch('resource/provider/load');
                try {
                    const res = await SpaceConnector.client.statistics.topic.serviceAccountSummary({
                        project_id: projectId.value,
                    });
                    state.data = res.results.map(item => ({
                        provider: {
                            label: item.provider,
                            providerColor: state.providers[item.provider].color,
                            href: getLink('provider', item.provider, item.service_account_id),
                        },
                        serviceAccount: {
                            label: item.service_account_name,
                            id: item.service_account_id,
                            href: referenceRouter(item.service_account_id, { resource_type: 'identity.ServiceAccount' }),
                        },
                        cloudService: {
                            count: item.cloud_service_count || 0,
                            href: getLink('cloudService', '', item.service_account_id),
                        },
                        server: {
                            count: item.server_count || 0,
                            href: getLink('server', '', item.service_account_id),
                        },
                        secret: {
                            count: item.secret_count || 0,
                        },
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
    @apply justify-center;
    display: flex;
    font-weight: bold;
    padding: 0 0.25rem;
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
