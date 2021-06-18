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
                <router-link :to="value.to" class="link-text" :style="{color: value.color}">
                    {{ value.label }}
                </router-link>
            </template>
            <template #col-service_account-format="{ value }">
                <router-link :to="value.to" class="link-text">
                    {{ value.label }}
                </router-link>
            </template>
            <template #col-compute-format="{ value }">
                <router-link :to="value.to" class="link-text">
                    {{ value.count }}
                </router-link>
            </template>
            <template #col-database-format="{ value }">
                <router-link :to="value.to" class="link-text">
                    {{ value.count }}
                </router-link>
            </template>
            <template #col-storage-format="{ value }">
                <router-link :to="value.to" class="link-text">
                    {{ value.count }}
                </router-link>
            </template>
        </p-data-table>
    </widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import bytes from 'bytes';
import { Location } from 'vue-router';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PDataTable,
} from '@spaceone/design-system';
import WidgetLayout from '@/common/components/WidgetLayout.vue';

import { store } from '@/store';
import { SpaceConnector } from '@/lib/space-connector';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { QueryHelper } from '@/lib/query';
import { INVENTORY_ROUTE } from '@/routes/inventory/inventory-route';

enum DATA_TYPE {
    compute = 'compute',
    database = 'database',
    storage = 'storage',
}
enum CLOUD_SERVICE_LABEL {
    compute = 'Compute',
    database = 'Database',
    storage = 'Storage',
}

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
                { name: 'compute', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.COMPUTE') },
                { name: 'database', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.DATABASE') },
                { name: 'storage', label: vm.$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.STORAGE') },
            ]),
            providers: computed(() => store.state.resource.provider.items),
        });

        /* util */
        const byteFormatter = (num, option = {}) => bytes(num, { ...option, unitSeparator: ' ', decimalPlaces: 1 });
        const getLocation = (type, provider, serviceAccountId) => {
            const query: Location['query'] = {
                provider,
                service: CLOUD_SERVICE_LABEL[type],
            };
            if (type === DATA_TYPE.storage) query.primary = 'false';

            // set filters
            queryHelper.setFilters([
                { k: 'collection_info.service_accounts', v: serviceAccountId, o: '=' },
                { k: 'project_id', o: '=', v: props.projectId },
            ]);

            const location: Location = {
                name: INVENTORY_ROUTE.CLOUD_SERVICE.TYPE._NAME,
                query: {
                    filters: queryHelper.rawQueryStrings,
                    ...query,
                },
            };
            return location;
        };

        /* api */
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
                        to: { name: 'serviceAccount', query: { provider: item.provider } },
                    },
                    service_account: {
                        label: item.service_account_name,
                        id: item.service_account_id,
                        to: referenceRouter(item.service_account_id, { resource_type: 'identity.ServiceAccount' }),
                    },
                    compute: {
                        count: item.server_count || 0,
                        to: getLocation(DATA_TYPE.compute, item.provider, item.service_account_id),
                    },
                    database: {
                        count: item.database_count || 0,
                        to: getLocation(DATA_TYPE.database, item.provider, item.service_account_id),
                    },
                    storage: {
                        count: byteFormatter(item.storage_size) || 0,
                        to: getLocation(DATA_TYPE.storage, item.provider, item.service_account_id),
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
