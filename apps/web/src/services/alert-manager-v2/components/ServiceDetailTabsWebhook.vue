<script lang="ts" setup>
import {
    reactive, computed,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    makeDistinctValueHandler, makeEnumValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable,
    PHeading,
    PButton,
    PStatus,
    PLazyImg,
    PSelectDropdown,
    PHeadingLayout,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import { webhookStateFormatter } from '@/services/alert-manager-v2/composables/refined-table-data';
import { WEBHOOK_STATE } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';

interface Props {
    // TODO: add type
    selectedItem?: any
}

const props = withDefaults(defineProps<Props>(), {
    selectedItem: undefined,
});

const emit = defineEmits<{(e: 'update:selected-item', value: string[]): void;
}>();

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const webhookListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('created_at', true);

const querySearchHandlers = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'plugin_info.plugin_id', label: 'Plugin' },
        ],
    }]),
    // TODO: change API
    valueHandlerMap: {
        name: makeDistinctValueHandler('monitoring.Webhook', 'name'),
        state: makeEnumValueHandler(WEBHOOK_STATE),
        'plugin_info.plugin_id': makeDistinctValueHandler('monitoring.Webhook', 'plugin_info.plugin_id'),
    },
});
const tableState = reactive({
    actionMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'enable',
            label: _i18n.t('ALERT_MANAGER.ENABLE'),
            disabled: state.proxySelectedItem[0]?.state === WEBHOOK_STATE.ENABLED,
        },
        {
            type: 'item',
            name: 'disable',
            label: _i18n.t('ALERT_MANAGER.DISABLED'),
            disabled: state.proxySelectedItem[0]?.state === WEBHOOK_STATE.DISABLED,
        },
        { type: 'divider' },
        {
            type: 'item',
            name: 'update',
            label: _i18n.t('ALERT_MANAGER.UPDATE'),
        },
        {
            type: 'item',
            name: 'delete',
            label: _i18n.t('ALERT_MANAGER.DELETE'),
        },
    ])),
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'plugin_info.plugin_id', label: 'Plugin' },
        { name: 'requests.total', label: 'Total Requests' },
        { name: 'requests.error', label: 'Failed Requests' },
    ]),
    tags: webhookListApiQueryHelper.setKeyItemSets(querySearchHandlers.keyItemSets).queryTags,
    totalCount: 0,
});
const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});
const state = reactive({
    loading: false,
    // TODO: temp data
    items: [{
        name: 'temp name',
        state: 'ENABLED',
        plugin_info: {
            plugin_id: 'plugin-aws-cloudtrail-mon-datasource',
        },
        requests: {
            total: 20,
            error: 30,
        },
    }],
    selectIndex: [],
    // TODO: add type
    proxySelectedItem: useProxyValue<any[]>('selectedItem', props, emit),
    isSelectedItem: computed(() => state.proxySelectedItem?.length),
});

const handleClickCreateButton = () => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE_V2.SERVICE.DETAIL.WEBHOOK.CREATE._NAME,
    }));
};
const handleSelectDropdownItem = (name) => {
    console.log('TODO: handleSelectDropdownItem', name);
};
const handleChangeToolbox = (options: any = {}) => {
    console.log('TODO: handleChangeToolbox', options);
};
const handleExportExcel = () => {
    console.log('TODO: handleExportExcel');
};
const handleSelectTableRow = (selectedItems: number[]) => {
    state.proxySelectedItem = selectedItems.map((i) => state.items[i]);
};
</script>

<template>
    <p-toolbox-table class="service-detail-tabs-webhook"
                     search-type="query"
                     selectable
                     sortable
                     exportable
                     :multi-select="false"
                     :loading="state.loading"
                     :total-count="tableState.totalCount"
                     :items="state.items"
                     :fields="tableState.fields"
                     :select-index.sync="state.selectIndex"
                     :query-tags="tableState.tags"
                     :key-item-sets="querySearchHandlers.keyItemSets"
                     :value-handler-map="querySearchHandlers.valueHandlerMap"
                     @change="handleChangeToolbox"
                     @refresh="handleChangeToolbox()"
                     @export="handleExportExcel"
                     @select="handleSelectTableRow"
    >
        <template #toolbox-top>
            <p-heading-layout class="pt-8 px-4">
                <template #heading>
                    <p-heading heading-type="sub"
                               use-total-count
                               :total-count="tableState.totalCount"
                               :title="$t('ALERT_MANAGER.WEBHOOK.TITLE')"
                    />
                </template>
                <template #extra>
                    <p-button style-type="primary"
                              icon-left="ic_plus_bold"
                              @click="handleClickCreateButton"
                    >
                        {{ $t('ALERT_MANAGER.CREATE') }}
                    </p-button>
                </template>
            </p-heading-layout>
        </template>
        <template #toolbox-left>
            <p-select-dropdown :menu="tableState.actionMenu"
                               :disabled="!state.isSelectedItem"
                               reset-selection-on-menu-close
                               :placeholder="$t('ALERT_MANAGER.ACTION')"
                               @select="handleSelectDropdownItem"
            />
        </template>
        <template #col-plugin_info.plugin_id-format="{value}">
            <div class="col-type">
                <p-lazy-img :src="storeState.plugins[value] ? storeState.plugins[value].icon : 'ic_webhook'"
                            error-icon="ic_webhook"
                            width="1.5rem"
                            height="1.5rem"
                />
                {{ storeState.plugins[value] ? storeState.plugins[value].label : value }}
            </div>
        </template>
        <template #col-state-format="{ value }">
            <p-status
                class="capitalize"
                v-bind="webhookStateFormatter(value)"
            />
        </template>
        <template #col-requests.total-format="{ value }">
            <span>{{ value || 0 }}</span>
        </template>
        <template #col-requests.error-format="{ value, item }">
            <span v-if="value"
                  class="col-failed-requests"
            >
                {{ value || 0 }}
                <span>({{ ((value / item?.requests?.total) * 100).toFixed(1) }}%)</span>
            </span>
        </template>
    </p-toolbox-table>
</template>

<style scoped lang="postcss">
.service-detail-tabs-webhook {
    border: none;
    .col-failed-requests {
        @apply text-red-500;
    }
    .col-type {
        @apply flex items-center;
        gap: 0.5rem;
    }
}
</style>
