<template>
    <widget-layout :title="$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.TITLE')" class="service-accounts-table">
        <p-data-table :fields="fields"
                      :sortable="false"
                      :selectable="false"
                      :bordered="false"
                      :loading="loading"
                      :items="data"
        >
            <template #col-provider-format="{ value }">
                <router-link :to="value.href" class="link-text" :style="{color: value.color}">
                    {{ value.label }}
                </router-link>
            </template>
            <template #col-service_account-format="{ value }">
                <router-link :to="value.href" class="link-text">
                    {{ value.label }}
                </router-link>
            </template>
            <template #col-server-format="{ value }">
                <router-link :to="value.href" class="link-text">
                    {{ value.count }}
                </router-link>
            </template>
            <template #col-cloud_service-format="{ value }">
                <router-link :to="value.href" class="link-text">
                    {{ value.count }}
                </router-link>
            </template>
            <template #col-credentials-format="{ value }">
                {{ value.count }}
            </template>
        </p-data-table>
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
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper();

        const state = reactive({
            data: [] as object[],
            loading: true,
            fields: computed(() => [
                { name: 'provider', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.PROVIDER') },
                { name: 'service_account', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.ACCOUNT_NAME') },
                { name: 'server', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.SERVER') },
                { name: 'cloud_service', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.CLOUD_SERVICE') },
                { name: 'credentials', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.CREDENTIALS') },
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
                    { k: 'project_id', v: props.projectId, o: '=' });
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
                    { k: 'project_id', v: props.projectId, o: '=' });
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
                    project_id: props.projectId,
                });
                state.data = res.results.map(item => ({
                    provider: {
                        label: state.providers[item.provider].label,
                        color: state.providers[item.provider].color,
                        href: getLink('provider', item.provider, item.service_account_id),
                    },
                    service_account: {
                        label: item.service_account_name,
                        id: item.service_account_id,
                        href: referenceRouter(item.service_account_id, { resource_type: 'identity.ServiceAccount' }),
                    },
                    cloud_service: {
                        count: item.cloud_service_count || 0,
                        href: getLink('cloudService', '', item.service_account_id),
                    },
                    server: {
                        count: item.server_count || 0,
                        href: getLink('server', '', item.service_account_id),
                    },
                    credentials: {
                        count: item.secret_count || 0,
                    },
                }));
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const init = () => {
            getData();
        };
        init();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-accounts-table {
    .p-data-table::v-deep {
        min-height: 5rem;
        border-radius: 0.125rem;
        margin-top: 0.75rem;

        th {
            @apply bg-gray-100 text-gray-400;
            height: 1.5rem;
            border: none;
            font-size: 0.75rem;
            font-weight: bold;
        }
        td {
            height: 2rem;
            .link-text {
                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
}
</style>
