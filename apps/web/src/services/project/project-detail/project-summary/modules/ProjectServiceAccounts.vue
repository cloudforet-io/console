<script lang="ts" setup>

import { byteFormatter } from '@cloudforet/core-lib';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataTable } from '@spaceone/design-system';
import { isEmpty } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocation } from 'vue-router';
import { useStore } from 'vuex';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { arrayToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const DATA_TYPE = {
    SERVER: 'SERVER',
    DATABASE: 'DATABASE',
    STORAGE: 'STORAGE',
} as const;
enum CLOUD_SERVICE_LABEL {
    SERVER = 'Server',
    DATABASE = 'Database',
    STORAGE = 'Storage',
}

interface TableColumnData {
    label?: string;
    count?: number;
    color?: string;
    to: RouteLocation;
}
interface Item {
    [key: string]: TableColumnData;
}

interface Props {
    projectId: string;
}

const props = defineProps<Props>();
const store = useStore();
const { t } = useI18n();

const queryHelper = new QueryHelper();

const state = reactive({
    loading: true,
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    items: [] as Item[],
    fields: computed(() => [
        { name: 'provider', label: t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.PROVIDER') },
        { name: 'service_account', label: t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.ACCOUNT_NAME') },
        { name: 'server', label: t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.SERVER') },
        { name: 'database', label: t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.DATABASE') },
        { name: 'storage', label: t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.STORAGE') },
    ]),
});

/* Util */
const getLocation = (type, provider, serviceAccountId) => {
    queryHelper.setFilters([
        { k: 'collection_info.service_account_id', v: serviceAccountId, o: '=' },
        { k: 'project_id', o: '=', v: props.projectId },
    ]);

    const location: RouteLocation = {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
        query: {
            provider: primitiveToQueryString(provider) ?? '',
            service: CLOUD_SERVICE_LABEL[type],
            filters: queryHelper.rawQueryStrings,
        } as RouteLocation['query'],
    } as RouteLocation;
    return location;
};
const getConvertedData = (rawData): Item[] => rawData.map((item) => ({
    provider: {
        label: state.providers[item.provider]?.label,
        color: state.providers[item.provider]?.color,
        to: {
            name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
            query: { provider: item.provider },
        },
    },
    service_account: {
        label: item.service_account_name,
        to: {
            name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
            query: {
                provider: item.provider,
                filters: arrayToQueryString([item.service_account_id]),
            },
        },
    },
    server: {
        count: item.server_count || 0,
        to: getLocation(DATA_TYPE.SERVER, item.provider, item.service_account_id),
    },
    database: {
        count: item.database_count || 0,
        to: getLocation(DATA_TYPE.DATABASE, item.provider, item.service_account_id),
    },
    storage: {
        count: byteFormatter(item.storage_size) || 0,
        to: getLocation(DATA_TYPE.STORAGE, item.provider, item.service_account_id),
    },
}));

/* api */
const getData = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.client.statistics.topic.serviceAccountSummary({
            project_id: props.projectId,
        });
        state.items = getConvertedData(results);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        state.loading = false;
    }
};

// LOAD REFERENCE STORE
(async () => {
    await store.dispatch('reference/provider/load');
})();

/* Watcher */
watch(() => state.providers, (providers) => {
    // todo: have to change to reference getters
    if (!isEmpty(providers)) {
        getData();
    }
}, { immediate: true });

</script>

<template>
    <widget-layout :title="t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.TITLE')"
                   class="service-accounts-table"
    >
        <p-data-table :fields="state.fields"
                      :sortable="false"
                      :selectable="false"
                      :bordered="false"
                      :loading="state.loading"
                      :items="state.items"
        >
            <template #col-provider-format="{ value }">
                <router-link :to="value.to"
                             class="link-text"
                             :style="{color: value.color}"
                >
                    {{ value.label }}
                </router-link>
            </template>
            <template #col-service_account-format="{ value }">
                <router-link :to="value.to"
                             class="link-text"
                >
                    {{ value.label }}
                </router-link>
            </template>
            <template #col-server-format="{ value }">
                <router-link :to="value.to"
                             class="link-text"
                >
                    {{ value.count }}
                </router-link>
            </template>
            <template #col-database-format="{ value }">
                <router-link :to="value.to"
                             class="link-text"
                >
                    {{ value.count }}
                </router-link>
            </template>
            <template #col-storage-format="{ value }">
                <router-link :to="value.to"
                             class="link-text"
                >
                    {{ value.count }}
                </router-link>
            </template>
        </p-data-table>
    </widget-layout>
</template>

<style lang="postcss" scoped>
.service-accounts-table {
    /* custom design-system component - p-data-table */
    :deep(.p-data-table) {
        @apply rounded-xs;
        min-height: 5rem;
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
