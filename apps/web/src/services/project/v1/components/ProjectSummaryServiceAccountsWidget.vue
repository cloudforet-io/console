<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { Location } from 'vue-router';

import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataTable } from '@cloudforet/mirinae';
import { byteFormatter } from '@cloudforet/utils';

import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { MENU_ID } from '@/lib/menu/config';
import { arrayToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import { useContentsAccessibility } from '@/common/composables/contents-accessibility';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type { CloudServiceMainPageUrlQuery } from '@/services/asset-inventory/types/cloud-service-page-type';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

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
    to: Location;
}
interface Item {
    [key: string]: TableColumnData;
}
interface Props {
    projectId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    projectId: '',
});
const allReferenceStore = useAllReferenceStore();
const userWorkspaceStore = useUserWorkspaceStore();

const { visibleContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
});
const state = reactive({
    loading: true,
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    items: [] as Item[],
    fields: computed(() => [
        { name: 'provider', label: i18n.t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.PROVIDER') },
        { name: 'service_account', label: i18n.t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.ACCOUNT_NAME') },
        { name: 'server', label: i18n.t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.SERVER') },
        { name: 'database', label: i18n.t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.DATABASE') },
        { name: 'storage', label: i18n.t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.STORAGE') },
    ]),
});

/* Util */
const getLocation = (type, provider, serviceAccountId) => {
    const query: CloudServiceMainPageUrlQuery = {
        provider: primitiveToQueryString(provider),
        service: CLOUD_SERVICE_LABEL[type],
        service_account: arrayToQueryString([serviceAccountId]),
        project: arrayToQueryString([props.projectId]),
    };

    const location: Location = {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
        query,
    };
    return location;
};
const getConvertedData = (rawData): Item[] => rawData.map((item) => ({
    provider: {
        label: state.providers[item.provider]?.label,
        color: state.providers[item.provider]?.color,
        to: {
            name: SERVICE_ACCOUNT_ROUTE._NAME,
            query: { provider: item.provider },
        },
    },
    service_account: {
        label: item.service_account_name,
        to: {
            name: SERVICE_ACCOUNT_ROUTE._NAME,
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
            workspace_id: storeState.currentWorkspaceId,
        });
        state.items = getConvertedData(results);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => state.providers, (providers) => {
    if (!isEmpty(providers)) getData();
}, { immediate: true });
</script>

<template>
    <widget-layout :title="$t('COMMON.WIDGETS.SERVICE_ACCOUNT_TABLE.TITLE')"
                   class="project-summary-service-accounts-widget"
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
                <component :is="visibleContents ? 'router-link' : 'div'"
                           :to="value.to"
                           class="link-text"
                           :class="{ 'text-only': !visibleContents }"
                >
                    {{ value.count }}
                </component>
            </template>
            <template #col-database-format="{ value }">
                <component :is="visibleContents ? 'router-link' : 'div'"
                           :to="value.to"
                           class="link-text"
                           :class="{ 'text-only': !visibleContents }"
                >
                    {{ value.count }}
                </component>
            </template>
            <template #col-storage-format="{ value }">
                <component :is="visibleContents ? 'router-link' : 'div'"
                           :to="value.to"
                           class="link-text"
                           :class="{ 'text-only': !visibleContents }"
                >
                    {{ value.count }}
                </component>
            </template>
        </p-data-table>
    </widget-layout>
</template>

<style lang="postcss" scoped>
.project-summary-service-accounts-widget {
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
                &:not(.text-only) {
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }
    }
}
</style>
